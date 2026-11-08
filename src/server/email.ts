import "server-only";

type Email = { to: string; subject: string; html: string; replyTo?: string };

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@mwafem.com";

/**
 * Sends an email through Resend's HTTP API. Returns false (and only logs)
 * until RESEND_API_KEY and EMAIL_FROM are configured, so forms keep working.
 */
export async function sendEmail({ to, subject, html, replyTo }: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info(`[email] not configured, skipped "${subject}" to ${to}`);
    return false;
  }
  // Automated tests use the reserved example.com domain. Never email it
  // (bounces hurt the sending domain), and don't send the organisers a
  // notification about a test registration or message either.
  const isTest = (address?: string) => !!address && /@example\.(com|org|net)$/i.test(address);
  if (isTest(to) || isTest(replyTo)) {
    console.info(`[email] test address, skipped "${subject}" to ${to}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      console.error(`[email] Resend ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}
