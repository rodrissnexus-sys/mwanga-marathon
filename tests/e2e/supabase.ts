// Direct calls to the Supabase REST/Auth APIs with the secret key, for test
// setup, cleanup and checking what the app wrote.

export const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const E2E_PREFIX = "e2e-";

export async function admin(path: string, init: RequestInit = {}) {
  const res = await fetch(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SECRET,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

export const accounts = {
  admin: { email: `${E2E_PREFIX}admin@example.com`, password: "E2e-admin-Pass-2026", role: "admin" },
  moderator: { email: `${E2E_PREFIX}moderator@example.com`, password: "E2e-moderator-Pass-2026", role: "moderator" },
} as const;

export async function deleteE2eUsers() {
  const { json } = await admin("/auth/v1/admin/users?per_page=1000");
  for (const user of json?.users ?? []) {
    if (user.email?.startsWith(E2E_PREFIX)) await admin(`/auth/v1/admin/users/${user.id}`, { method: "DELETE" });
  }
}

export async function deleteE2eRows() {
  await admin(`/rest/v1/registrations?email=like.${E2E_PREFIX}*`, { method: "DELETE" });
  await admin(`/rest/v1/contact_messages?email=like.${E2E_PREFIX}*`, { method: "DELETE" });
  // local requests share one IP; reset the form rate limits between runs
  await admin("/rest/v1/rate_limits?key=neq.__none__", { method: "DELETE" });
}
