// Verifies the database security rules against the real Supabase project.
// Creates throwaway users (admin, moderator, public sign-up), checks what each
// role — and an anonymous visitor — can read and write, then cleans up.
//
// usage: node --env-file=.env.local scripts/check-rls.mjs

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = `Rls-check-${crypto.randomUUID()}`;

let failures = 0;
const results = [];

function check(name, ok, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `  -> ${detail}`}`);
  if (!ok) failures++;
}

async function api(path, { key = PUBLISHABLE, token, method = "GET", body, prefer } = {}) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: {
      apikey: key,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

const admin = (path, opts = {}) => api(path, { ...opts, key: SECRET });

async function createUser(email, appMeta) {
  const r = await admin("/auth/v1/admin/users", {
    method: "POST",
    body: { email, password: PASSWORD, email_confirm: true, app_metadata: appMeta, user_metadata: { name: email } },
  });
  if (r.status >= 300) throw new Error(`create ${email}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.id;
}

async function signIn(email) {
  const r = await api("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password: PASSWORD } });
  if (r.status !== 200) throw new Error(`sign in ${email}: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json.access_token;
}

const tag = Date.now();
const emails = {
  admin: `rls-admin-${tag}@example.com`,
  moderator: `rls-mod-${tag}@example.com`,
  stranger: `rls-stranger-${tag}@example.com`,
};
const ids = {};
let testRegistrationId;

try {
  ids.admin = await createUser(emails.admin, { role: "admin" });
  ids.moderator = await createUser(emails.moderator, { role: "moderator" });
  ids.stranger = await createUser(emails.stranger, {}); // like a public sign-up
  const tokens = {
    admin: await signIn(emails.admin),
    moderator: await signIn(emails.moderator),
    stranger: await signIn(emails.stranger),
  };

  // A registration to look at (inserted the way the server will: secret key).
  const reg = await admin("/rest/v1/registrations", {
    method: "POST",
    prefer: "return=representation",
    body: {
      first_name: "Rls", last_name: "Check", email: "rls@example.com", phone_number: "000",
      event_id: 2, shirt_size_id: 1, collection_venue_id: 1, country_id: 1, nationality_id: 1,
      gender_id: 1, date_of_birth: "1990-01-01", emergency_contact_name: "X",
      emergency_contact_number: "000", locale: "sw",
    },
  });
  testRegistrationId = reg.json?.[0]?.id;
  check("server can insert a registration", reg.status === 201, JSON.stringify(reg.json));
  check("registration_id is generated (MWF-YYYY-NNNNN)",
    /^MWF-\d{4}-\d{5}$/.test(reg.json?.[0]?.registration_id ?? ""), reg.json?.[0]?.registration_id);

  // --- anonymous visitor
  let r = await api("/rest/v1/events?select=id");
  check("visitor can read events", r.status === 200 && r.json.length > 0, `${r.status}`);
  r = await api("/rest/v1/registrations?select=id");
  check("visitor cannot read registrations", r.status === 401 || r.status === 403, `${r.status} ${JSON.stringify(r.json)}`);
  r = await api("/rest/v1/profiles?select=id");
  check("visitor cannot read profiles", r.status === 401 || r.status === 403, `${r.status}`);
  r = await api("/rest/v1/registrations", { method: "POST", body: { first_name: "x" } });
  check("visitor cannot insert registrations", r.status === 401 || r.status === 403, `${r.status}`);
  r = await api("/rest/v1/events", { method: "POST", body: { name_en: "Hacked" } });
  check("visitor cannot insert events", r.status === 401 || r.status === 403, `${r.status}`);
  r = await api("/rest/v1/events?id=eq.1", { method: "PATCH", body: { name_en: "Hacked" }, prefer: "return=representation" });
  check("visitor cannot edit events", r.status === 401 || r.status === 403, `${r.status} ${JSON.stringify(r.json)}`);
  r = await api("/rest/v1/rpc/hit_rate_limit", { method: "POST", body: { p_key: "x", p_max: 1, p_window_seconds: 60 } });
  check("visitor cannot call the rate limiter", r.status === 401 || r.status === 403 || r.status === 404, `${r.status}`);

  // --- public sign-up (logged in, but not staff)
  r = await api("/rest/v1/registrations?select=id", { token: tokens.stranger });
  check("signed-up stranger sees no registrations", r.status === 200 && r.json.length === 0, `${r.status} ${JSON.stringify(r.json)}`);
  r = await api("/rest/v1/profiles?select=id", { token: tokens.stranger });
  check("signed-up stranger has no staff profile", r.status === 200 && r.json.length === 0, JSON.stringify(r.json));
  r = await api("/rest/v1/events", { method: "POST", token: tokens.stranger, body: { name_en: "Hacked" } });
  check("signed-up stranger cannot insert events", r.status === 403 || r.status === 401, `${r.status}`);

  // --- moderator
  r = await api("/rest/v1/registrations?select=id", { token: tokens.moderator });
  check("moderator can read registrations", r.status === 200 && r.json.some((x) => x.id === testRegistrationId), JSON.stringify(r.json));
  r = await api(`/rest/v1/registrations?id=eq.${testRegistrationId}`, {
    method: "PATCH", token: tokens.moderator, prefer: "return=representation",
    body: { payment_status: "confirmed", payment_confirmed_at: new Date().toISOString(), payment_confirmed_by: ids.moderator },
  });
  check("moderator can confirm a payment", r.status === 200 && r.json?.[0]?.payment_status === "confirmed", `${r.status} ${JSON.stringify(r.json)}`);
  r = await api("/rest/v1/events", { method: "POST", token: tokens.moderator, body: { name_en: "Mod event" } });
  check("moderator cannot insert events", r.status === 403, `${r.status}`);
  r = await api("/rest/v1/profiles?select=id", { token: tokens.moderator });
  check("moderator sees only own profile", r.status === 200 && r.json.length === 1 && r.json[0].id === ids.moderator, JSON.stringify(r.json));
  r = await api(`/rest/v1/profiles?id=eq.${ids.moderator}`, { method: "PATCH", token: tokens.moderator, body: { role: "admin" }, prefer: "return=representation" });
  check("moderator cannot promote themselves", r.status === 200 && r.json.length === 0, `${r.status} ${JSON.stringify(r.json)}`);
  r = await api(`/rest/v1/registrations?id=eq.${testRegistrationId}`, { method: "DELETE", token: tokens.moderator, prefer: "return=representation" });
  check("moderator cannot delete registrations", r.status === 200 && r.json.length === 0, `${r.status} ${JSON.stringify(r.json)}`);

  // --- admin
  r = await api("/rest/v1/events", { method: "POST", token: tokens.admin, prefer: "return=representation", body: { name_en: "Admin test event", is_active: false } });
  check("admin can insert events", r.status === 201, `${r.status} ${JSON.stringify(r.json)}`);
  const eventId = r.json?.[0]?.id;
  r = await api("/rest/v1/events?select=id&is_active=eq.false");
  check("visitor cannot see inactive events", r.status === 200 && !r.json.some((x) => x.id === eventId), JSON.stringify(r.json));
  r = await api(`/rest/v1/events?id=eq.${eventId}`, { method: "DELETE", token: tokens.admin, prefer: "return=representation" });
  check("admin can delete events", r.status === 200 && r.json.length === 1, `${r.status}`);
  r = await api("/rest/v1/profiles?select=id", { token: tokens.admin });
  check("admin can read all profiles", r.status === 200 && r.json.length >= 2, JSON.stringify(r.json));
} catch (e) {
  failures++;
  results.push(`ERROR ${e.message}`);
} finally {
  if (testRegistrationId) await admin(`/rest/v1/registrations?id=eq.${testRegistrationId}`, { method: "DELETE" });
  for (const id of Object.values(ids)) await admin(`/auth/v1/admin/users/${id}`, { method: "DELETE" });
}

console.log(results.join("\n"));
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
