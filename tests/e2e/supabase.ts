// Direct calls to the Supabase REST/Auth APIs with the secret key, for test
// setup, cleanup and checking what the app wrote.

export const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const E2E_PREFIX = "e2e-";

type Request = { method?: string; headers?: Record<string, string>; body?: string };

/**
 * HTTP request to Supabase. With E2E_USE_CURL=1 it goes through curl instead
 * of Node's fetch (for networks where Node can't reach Supabase but curl can).
 */
export async function request(url: string, { method = "GET", headers = {}, body }: Request = {}) {
  if (process.env.E2E_USE_CURL === "1") {
    const { execFileSync } = await import("node:child_process");
    const args = ["-s", "-m", "30", "-X", method, "-w", "\n%{http_code}", "--data-binary", "@-"];
    for (const [name, value] of Object.entries(headers)) args.push("-H", `${name}: ${value}`);
    let out = "";
    for (let attempt = 1; ; attempt++) {
      try {
        out = execFileSync("curl", [...args, url], { input: body ?? "", encoding: "utf8" });
        break;
      } catch (error) {
        if (attempt === 3) throw error; // network error (curl gives no HTTP status)
      }
    }
    const split = out.lastIndexOf("\n");
    const text = out.slice(0, split);
    return { status: Number(out.slice(split + 1)), json: text ? JSON.parse(text) : null };
  }
  const res = await fetch(url, { method, headers, body });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

export async function admin(path: string, init: Request = {}) {
  return request(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SECRET,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
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
