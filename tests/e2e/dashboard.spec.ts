import { expect, test, type Page } from "@playwright/test";
import { accounts, admin, E2E_PREFIX, PUBLISHABLE, URL } from "./supabase";

async function login(page: Page, who: keyof typeof accounts) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(accounts[who].email);
  await page.locator('input[type="password"]').fill(accounts[who].password);
  await page.locator('button[type="submit"]').click();
  // the dashboard opens with client-side navigation (no full page load)
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
}

test("visitors are sent from the dashboard to the login page", async ({ page }) => {
  await page.goto("/dashboard/registration");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/sw/dashboard");
  await expect(page).toHaveURL(/\/sw\/login$/);
});

test("wrong password is rejected", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(accounts.moderator.email);
  await page.locator('input[type="password"]').fill("definitely-wrong");
  await page.locator('button[type="submit"]').click();
  await expect(page.getByText("Invalid email or password. Please try again.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

async function createRegistration(tag: string) {
  const email = `${E2E_PREFIX}${tag}-${Date.now()}@example.com`;
  const created = await admin("/rest/v1/registrations", {
    method: "POST",
    body: JSON.stringify({
      first_name: "Payment", last_name: "Check", email, phone_number: "000",
      event_id: 2, shirt_size_id: 1, collection_venue_id: 1, country_id: 1, nationality_id: 1,
      gender_id: 1, date_of_birth: "1990-01-01", emergency_contact_name: "X", emergency_contact_number: "000",
    }),
  });
  expect(created.status).toBe(201);
  return { email, id: created.json[0].id as number };
}

async function openPendingPayment(page: Page, email: string) {
  await page.goto("/dashboard/payments");
  await page.getByLabel("Search payments").fill(email);
  const row = page.locator("tbody tr", { hasText: "Payment Check" });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: "Check & confirm" }).click();
}

const reference = () => `E2E${Date.now()}`;

test("a moderator checks a pending payment and confirms it with its reference", async ({ page }) => {
  const { email, id } = await createRegistration("pay");
  const ref = reference();

  await login(page, "moderator");
  await openPendingPayment(page, email);
  await page.getByLabel("Transaction ID / reference").fill(ref);
  await page.getByRole("button", { name: "Confirm payment" }).click();
  await expect(page.getByText("Payment confirmed. The participant will get an email.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Receipt" })).toBeVisible();

  const { json } = await admin(`/rest/v1/registrations?id=eq.${id}&select=payment_status,payment_confirmed_by_name,payment_method,payment_reference,payment_currency`);
  expect(json[0]).toEqual({
    payment_status: "confirmed", payment_confirmed_by_name: "E2E moderator",
    payment_method: "mobile_money", payment_reference: ref, payment_currency: "TZS",
  });
  // the change is in the payment log, with who did it
  const log = await admin(`/rest/v1/payment_events?registration_id=eq.${id}&select=status,previous_status,actor_name,reference`);
  expect(log.json).toEqual([{ status: "confirmed", previous_status: "pending", actor_name: "E2E moderator", reference: ref }]);
});

test("a reference already used for another registration needs a second confirmation", async ({ page }) => {
  const first = await createRegistration("dup-a");
  const second = await createRegistration("dup-b");
  const ref = reference();
  await admin(`/rest/v1/registrations?id=eq.${first.id}`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: "confirmed", payment_reference: ref, payment_method: "mobile_money" }),
  });

  await login(page, "moderator");
  await openPendingPayment(page, second.email);
  await page.getByLabel("Transaction ID / reference").fill(ref.toLowerCase());
  await page.getByRole("button", { name: "Confirm payment" }).click();
  await expect(page.getByText("This reference was already used for:")).toBeVisible();
  let { json } = await admin(`/rest/v1/registrations?id=eq.${second.id}&select=payment_status`);
  expect(json[0].payment_status).toBe("pending");

  await page.getByRole("button", { name: "Confirm anyway" }).click();
  await expect(page.getByText("Payment confirmed. The participant will get an email.")).toBeVisible();
  ({ json } = await admin(`/rest/v1/registrations?id=eq.${second.id}&select=payment_status`));
  expect(json[0].payment_status).toBe("confirmed");
});

test("only an admin can undo a confirmed payment", async ({ page }) => {
  const { email, id } = await createRegistration("undo");
  await admin(`/rest/v1/registrations?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ payment_status: "confirmed" }) });

  // the database refuses a moderator, even when called directly
  const token = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUBLISHABLE, "Content-Type": "application/json" },
    body: JSON.stringify({ email: accounts.moderator.email, password: accounts.moderator.password }),
  }).then((r) => r.json());
  const direct = await fetch(`${URL}/rest/v1/registrations?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ payment_status: "pending" }),
  });
  expect(direct.ok).toBe(false);

  await login(page, "admin");
  await page.goto("/dashboard/payments");
  await page.getByRole("tab", { name: /Paid/ }).click();
  await page.getByLabel("Search payments").fill(email);
  const row = page.locator("tbody tr", { hasText: "Payment Check" });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: "Open" }).click();
  await page.getByRole("button", { name: "Undo confirmation" }).click();
  await page.getByLabel("Why is this being undone? (kept in the history)").fill("E2E: confirmed by mistake");
  await page.getByRole("button", { name: "Undo confirmation" }).click();
  await expect(page.getByText("Payment set back to pending.")).toBeVisible();

  const { json } = await admin(`/rest/v1/registrations?id=eq.${id}&select=payment_status,payment_reference`);
  expect(json[0]).toEqual({ payment_status: "pending", payment_reference: null });
});

test("a moderator marks a message as handled", async ({ page }) => {
  const email = `${E2E_PREFIX}msg-${Date.now()}@example.com`;
  await admin("/rest/v1/contact_messages", {
    method: "POST",
    body: JSON.stringify({ kind: "contact", name: "E2E Visitor", email, message: "When does registration close?" }),
  });

  await login(page, "moderator");
  await page.goto("/dashboard/messages");
  const card = page.locator("article", { hasText: email });
  await card.getByRole("button", { name: "Mark as handled" }).click();
  await expect(card).toHaveCount(0);

  const { json } = await admin(`/rest/v1/contact_messages?email=eq.${encodeURIComponent(email)}&select=handled_by_name`);
  expect(json[0].handled_by_name).toBe("E2E moderator");
});

test("a moderator only sees the work pages and cannot open staff accounts", async ({ page }) => {
  await login(page, "moderator");
  const nav = page.getByRole("navigation", { name: "Dashboard" });
  await expect(nav.getByRole("link", { name: "Payments" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Staff accounts" })).toHaveCount(0);
  await page.goto("/dashboard/users");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("an admin can open staff accounts", async ({ page }) => {
  await login(page, "admin");
  await page.goto("/dashboard/user-management");
  await expect(page).toHaveURL(/\/dashboard\/users$/);
  await expect(page.getByText(accounts.moderator.email)).toBeVisible();
});
