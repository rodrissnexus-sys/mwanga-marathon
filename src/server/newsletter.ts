"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const emailSchema = z.email().max(255);

/**
 * Footer newsletter sign-up. Saves the address for the dashboard list;
 * signing up twice is fine (no error, no duplicate). 5 per IP per 10 minutes.
 */
export async function subscribeToNewsletter(email: string, locale: "en" | "sw" = "en") {
  const parsed = emailSchema.safeParse(String(email ?? "").trim().toLowerCase());
  if (!parsed.success) return { success: false, error: "invalid" as const };

  const supabase = createAdminClient();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { data: allowed } = await supabase.rpc("hit_rate_limit", {
    p_key: `newsletter:${ip}`,
    p_max: 5,
    p_window_seconds: 600,
  });
  if (!allowed) return { success: false, error: "tooMany" as const };

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data, locale: locale === "sw" ? "sw" : "en" });
  // 23505: already subscribed
  if (error && error.code !== "23505") {
    console.error("[newsletter] insert failed", error);
    return { success: false, error: "failed" as const };
  }
  return { success: true };
}
