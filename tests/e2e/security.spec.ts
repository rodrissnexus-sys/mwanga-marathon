import { expect, test } from "@playwright/test";
import { PUBLISHABLE, request, URL } from "./supabase";

// What anyone could try with the public key that ships in the website.
test("the public key cannot read or write private data", async () => {
  const headers = { apikey: PUBLISHABLE, "Content-Type": "application/json" };

  for (const table of ["registrations", "contact_messages", "profiles", "payment_events"]) {
    const res = await request(`${URL}/rest/v1/${table}?select=*`, { headers });
    expect([401, 403], `${table} read`).toContain(res.status);
  }
  const insert = await request(`${URL}/rest/v1/registrations`, { method: "POST", headers, body: JSON.stringify({ first_name: "x" }) });
  expect([401, 403]).toContain(insert.status);
  const edit = await request(`${URL}/rest/v1/events?id=eq.1`, { method: "PATCH", headers, body: JSON.stringify({ name_en: "hacked" }) });
  expect([401, 403]).toContain(edit.status);
});
