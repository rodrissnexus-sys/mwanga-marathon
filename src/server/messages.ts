"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import type { z } from "zod";
import { contactMessageSchema as schema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_EMAIL, sendEmail } from "./email";
import { contactNotification } from "./email-templates";

/**
 * Sponsors page forms. Saves the message for the dashboard and emails the
 * organisers. Limited to 5 messages per IP per 10 minutes.
 */
export async function submitContactMessage(input: z.input<typeof schema>, locale: "en" | "sw" = "en") {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please check the form and try again." };

  const supabase = createAdminClient();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { data: allowed } = await supabase.rpc("hit_rate_limit", {
    p_key: `contact:${ip}`,
    p_max: 5,
    p_window_seconds: 600,
  });
  if (!allowed) return { success: false, error: "Too many messages. Please try again later." };

  const message = parsed.data;
  const { error } = await supabase.from("contact_messages").insert({ ...message, locale });
  if (error) {
    console.error("[contact] insert failed", error);
    return { success: false, error: "Failed to submit form. Please try again." };
  }

  after(async () => {
    const email = contactNotification({
      ...message,
      sponsorshipTier: "sponsorship_tier" in message ? message.sponsorship_tier : null,
    });
    await sendEmail({ to: ADMIN_EMAIL, ...email, replyTo: message.email });
  });

  return { success: true };
}
