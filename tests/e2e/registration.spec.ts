import { expect, test, type Page } from "@playwright/test";
import { admin, E2E_PREFIX } from "./supabase";

const TEXT = {
  en: { next: "Next", submit: "Complete Registration", done: "You are registered, E2E!", check: "Check status", status: "Waiting for payment", notFound: /couldn.t find a registration/ },
  sw: { next: "Endelea", submit: "Kamilisha Usajili", done: "Umesajiliwa, E2E!", check: "Angalia hali", status: "Inasubiri malipo", notFound: /Hatukupata usajili/ },
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

  // 1. about you (choices are radio buttons inside tap-cards)
  const choose = (name: string, value?: string) =>
    form.locator("label", { has: page.locator(`input[name="${name}"]${value ? `[value="${value}"]` : ""}`) }).first().click();
  await form.locator('input[name="firstName"]').fill("E2E");
  await form.locator('input[name="lastName"]').fill(locale.toUpperCase());
  await form.locator('input[name="phoneNumber"]').fill("+255700000001");
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="dateOfBirth"]').fill(PERSON[locale].dateOfBirth);
  await choose("gender_id");
  await choose("nationality", "tz_ea");
  await expect(form.locator('select[name="country_id"] option:checked')).toHaveText("Tanzania"); // filled in for them
  await form.locator('input[name="idOrPassport"]').fill("E2E-ID-1");
  await form.getByRole("button", { name: t.next }).click();

  // 2. your race
  await expect(form.locator('input[name="event_id"]').nth(1)).toBeAttached();
  await choose("event_id");
  const category = form.locator('input[name="participantCategory"]');
  if (PERSON[locale].category === "child") {
    await expect(category).toHaveCount(1); // only "child" is offered, already chosen
    await expect(category).toBeChecked();
    await choose("kidsShirtSize");
  } else {
    await choose("participantCategory", PERSON[locale].category);
    await choose("shirtSize", "L");
  }
  await choose("collection_venue_id");
  await form.getByRole("button", { name: t.next }).click();

  // 3. emergency contact + summary
  await form.locator('input[name="emergencyContactName"]').fill("E2E Contact");
  await form.locator('input[name="emergencyContactNumber"]').fill("+255700000002");
  await expect(form.getByText(`E2E ${locale.toUpperCase()}`)).toBeVisible(); // summary
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

    // "check my registration" with name + phone: wrong phone → not found;
    // right phone → pending, with the registration ID shown back
    const t = TEXT[locale];
    await page.goto(`${locale === "sw" ? "/sw" : ""}/registration-status`, { waitUntil: "networkidle" });
    await page.locator("#status-name").fill(`e2e ${locale}`); // any case, first + last name
    await page.locator("#status-phone").fill("0711 111 111");
    await page.getByRole("button", { name: t.check }).click();
    await expect(page.getByText(t.notFound)).toBeVisible();
    await page.locator("#status-phone").fill("0700 000 001"); // registered as +255700000001
    await page.getByRole("button", { name: t.check }).click();
    await expect(page.getByText(t.status).first()).toBeVisible();
    await expect(page.getByText(registrationId)).toBeVisible(); // the ID is shown back
  });
}
