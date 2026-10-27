import { expect, test } from "@playwright/test";
import { PUBLISHABLE, URL } from "./supabase";

// What anyone could try with the public key that ships in the website.
test("the public key cannot read or write private data", async ({ request }) => {
  const headers = { apikey: PUBLISHABLE, "Content-Type": "application/json" };

  for (const table of ["registrations", "contact_messages", "profiles"]) {
    const res = await request.get(`${URL}/rest/v1/${table}?select=*`, { headers });
    expect([401, 403], `${table} read`).toContain(res.status());
  }
  const insert = await request.post(`${URL}/rest/v1/registrations`, { headers, data: { first_name: "x" } });
  expect([401, 403]).toContain(insert.status());
  const edit = await request.patch(`${URL}/rest/v1/events?id=eq.1`, { headers, data: { name_en: "hacked" } });
  expect([401, 403]).toContain(edit.status());
});
