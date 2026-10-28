import { expect, test, type Page } from "@playwright/test";
import { admin, E2E_PREFIX } from "./supabase";

const TEXT = {
  en: { next: "Next", country: "Select Country", submit: "Complete Registration", done: "You are registered, E2E!", check: "Check status", status: "Waiting for payment", notFound: /couldn.t find a registration/ },
  sw: { next: "Endelea", country: "Chagua Nchi", submit: "Kamilisha Usajili", done: "Umesajiliwa, E2E!", check: "Angalia hali", status: "Inasubiri malipo", notFound: /Hatukupata usajili/ },
};

// English: an adult choosing "club member"; Swahili: a child (type and kids'
// T-shirt sizes follow from the date of birth).
const PERSON = {
  en: { dateOfBirth: "1990-05-05", category: "club" },
  sw: { dateOfBirth: "2018-03-01", category: "child" },
} as const;

async function register(page: Page, locale: "en" | "sw", email: string) {
  const t = TEXT[locale];
  await page.goto(locale === "sw" ? "/sw/register" : "/register", { waitUntil: "networkidle" });
  const form = page.locator("section#register form");

  // 1. personal information
  await form.locator('input[name="firstName"]').fill("E2E");
  await form.locator('input[name="lastName"]').fill(locale.toUpperCase());
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="phoneNumber"]').fill("+255700000001");
  await form.locator('input[name="dateOfBirth"]').fill(PERSON[locale].dateOfBirth);
  await form.getByRole("button", { name: t.next }).click();

  // 2. event details (wait for the options loaded from the database)
  await expect(form.locator('select[name="event"] option').nth(2)).toBeAttached({ timeout: 15_000 });
  await form.locator('select[name="event"]').selectOption({ index: 2 });
  // radios are visually hidden inside styled labels
  const category = form.locator('input[name="participantCategory"]');
  if (PERSON[locale].category === "child") {
    await expect(category).toHaveCount(1); // only "child" is offered, already chosen
    await expect(category).toBeChecked();
    await form.locator('label', { has: page.locator('input[name="kidsShirtSize"]') }).first().click();
  } else {
    await form.locator('label', { has: page.locator(`input[name="participantCategory"][value="${PERSON[locale].category}"]`) }).click();
    await form.locator('label', { has: page.locator('input[name="shirtSize"][value="L"]') }).click();
  }
  await form.locator('select[name="collectionVenue"]').selectOption({ index: 1 });
  await form.getByRole("button", { name: t.next }).click();

  // 3. additional information
  await form.locator('select[name="nationality"]').selectOption("tz_ea");
  await form.getByText(t.country, { exact: true }).click();
  await form.getByText("Tanzania", { exact: true }).click();
  await form.locator('select[name="gender"]').selectOption({ index: 1 });
  await form.locator('input[name="idNumber"]').fill("E2E-ID-1");
  await form.getByRole("button", { name: t.next }).click();

  // 4. emergency contact
  await form.locator('input[name="emergencyContactName"]').fill("E2E Contact");
  await form.locator('input[name="emergencyContactNumber"]').fill("+255700000002");
  await form.getByRole("button", { name: t.submit }).click();

  // the confirmation shows the registration ID (the payment reference)
  await expect(page.getByText(t.done)).toBeVisible({ timeout: 20_000 });
  return (await page.getByText(/^MWF-\d{4}-\d{5}$/).first().textContent())!.trim();
}

for (const locale of ["en", "sw"] as const) {
  test(`registers a participant on the ${locale === "en" ? "English" : "Swahili"} site`, async ({ page }) => {
    const email = `${E2E_PREFIX}runner-${locale}-${Date.now()}@example.com`;
    const registrationId = await register(page, locale, email);

    const { json } = await admin(`/rest/v1/registrations?email=eq.${encodeURIComponent(email)}&select=*`);
    expect(json).toHaveLength(1);
    expect(json[0].locale).toBe(locale);
    expect(json[0].nationality_category).toBe("tz_ea");
    expect(json[0].payment_status).toBe("pending");
    expect(json[0].registration_id).toMatch(/^MWF-\d{4}-\d{5}$/);
    expect(json[0].participant_category).toBe(PERSON[locale].category);
    expect(json[0].kids_shirt_size_id !== null).toBe(PERSON[locale].category === "child");
    expect(json[0].registration_id).toBe(registrationId);

    // "check my registration": wrong phone → not found; right phone → pending
    const t = TEXT[locale];
    await page.goto(`${locale === "sw" ? "/sw" : ""}/registration-status?id=${registrationId}`, { waitUntil: "networkidle" });
    await expect(page.locator("#status-id")).toHaveValue(registrationId);
    await page.locator("#status-phone").fill("0711 111 111");
    await page.getByRole("button", { name: t.check }).click();
    await expect(page.getByText(t.notFound)).toBeVisible();
    await page.locator("#status-phone").fill("0700 000 001"); // registered as +255700000001
    await page.getByRole("button", { name: t.check }).click();
    await expect(page.getByText(t.status)).toBeVisible();
  });
}
