import { expect, test, type Page } from "@playwright/test";
import { accounts, admin, E2E_PREFIX } from "./supabase";

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

test("a moderator finds a registration and confirms its payment", async ({ page }) => {
  const email = `${E2E_PREFIX}pay-${Date.now()}@example.com`;
  const created = await admin("/rest/v1/registrations", {
    method: "POST",
    body: JSON.stringify({
      first_name: "Payment", last_name: "Check", email, phone_number: "000",
      event_id: 2, shirt_size_id: 1, collection_venue_id: 1, country_id: 1, nationality_id: 1,
      gender_id: 1, date_of_birth: "1990-01-01", emergency_contact_name: "X", emergency_contact_number: "000",
    }),
  });
  expect(created.status).toBe(201);

  await login(page, "moderator");
  await page.goto("/dashboard/registration");
  await page.getByPlaceholder("Search registrations...").fill(email);
  const row = page.locator("tbody tr", { hasText: email });
  await expect(row).toHaveCount(1);
  await row.getByTitle("Confirm Payment").click();
  await page.getByRole("button", { name: "Confirm Payment" }).last().click();

  await expect.poll(async () => {
    const { json } = await admin(`/rest/v1/registrations?email=eq.${encodeURIComponent(email)}&select=payment_status,payment_confirmed_by_name`);
    return json[0];
  }).toEqual({ payment_status: "confirmed", payment_confirmed_by_name: "E2E moderator" });
});

test("a moderator cannot open user management", async ({ page }) => {
  await login(page, "moderator");
  await page.goto("/dashboard/user-management");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("an admin can open user management and sees staff accounts", async ({ page }) => {
  await login(page, "admin");
  await page.goto("/dashboard/user-management");
  await expect(page.getByText(accounts.moderator.email)).toBeVisible();
});
