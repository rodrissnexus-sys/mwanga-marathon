import { expect, test } from "@playwright/test";
import { admin, E2E_PREFIX } from "./supabase";

test("the sponsors contact form saves a message", async ({ page }) => {
  const email = `${E2E_PREFIX}contact-${Date.now()}@example.com`;
  await page.goto("/sponsors", { waitUntil: "networkidle" }); // interactive once hydrated
  await page.getByRole("button", { name: "Get in Touch" }).click();
  await page.locator("#name").fill("E2E Contact");
  await page.locator("#email").fill(email);
  await page.locator("#subject").fill("Sponsorship question");
  await page.locator("#message").fill("Hello from the end-to-end test.");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByText("Thank You!")).toBeVisible({ timeout: 15_000 });

  const { json } = await admin(`/rest/v1/contact_messages?email=eq.${encodeURIComponent(email)}&select=kind,subject,locale`);
  expect(json).toEqual([{ kind: "contact", subject: "Sponsorship question", locale: "en" }]);
});

test("the footer newsletter box saves a subscriber once", async ({ page }) => {
  const email = `${E2E_PREFIX}news-${Date.now()}@example.com`;
  for (const _ of [1, 2]) {
    await page.goto("/sw", { waitUntil: "networkidle" });
    const footer = page.locator("footer");
    await footer.getByPlaceholder("Barua pepe yako").fill(email);
    await footer.getByRole("button", { name: "Jiunge" }).click();
    await expect(footer.getByText("Asante! Umeongezwa kwenye orodha.")).toBeVisible();
  }
  const { json } = await admin(`/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=locale`);
  expect(json).toEqual([{ locale: "sw" }]);
});
