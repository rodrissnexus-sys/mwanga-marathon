"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFee } from "@/lib/payments";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
});

// Phone numbers are compared on their last 9 digits, so 0755 002 886,
// +255755002886 and 255 755 002 886 all match.
const phoneKey = (phone: string) => phone.replace(/\D/g, "").slice(-9);

// Lower case, no accents, single spaces.
const normalise = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9' -]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Public "check my registration" with the name and phone number used to
 * register. Every word typed must be part of the participant's name (so the
 * first name, last name or full name all work); one phone can return several
 * people (e.g. a parent who registered their children). Returns only what
 * the participant needs, never personal details. 10 lookups per IP per 10
 * minutes.
 */
export async function lookupRegistration(input: z.input<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "notFound" as const };

  const words = normalise(parsed.data.name).split(" ").filter((w) => w.length >= 2);
  const key = phoneKey(parsed.data.phone);
  if (!words.length || key.length < 9) return { success: false, error: "notFound" as const };

  const supabase = createAdminClient();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { data: allowed } = await supabase.rpc("hit_rate_limit", {
    p_key: `status:${ip}`,
    p_max: 10,
    p_window_seconds: 600,
  });
  if (!allowed) return { success: false, error: "tooMany" as const };

  // narrow down by the longest name word, then check name and phone exactly
  const longest = [...words].sort((a, b) => b.length - a.length)[0];
  const { data: rows } = await supabase
    .from("registrations")
    .select(`registration_id, first_name, last_name, phone_number, participant_category, nationality_category,
      payment_status, payment_confirmed_at, created_at,
      event:events(name_en, name_sw, is_kids_event, local_price, foreign_price, local_kids_price),
      nationality:countries!registrations_nationality_id_fkey(code),
      collection_venue:collection_venues(name_en, name_sw)`)
    .ilike("search_text", `%${longest.replace(/[\\%_]/g, (c) => `\\${c}`)}%`)
    .is("deleted_at", null)
    .order("created_at")
    .limit(200);

  const matches = (rows ?? []).filter((r) => {
    if (phoneKey(r.phone_number) !== key) return false;
    const fullName = ` ${normalise(`${r.first_name} ${r.last_name}`)} `;
    return words.every((w) => fullName.includes(` ${w}`));
  });
  if (!matches.length) return { success: false, error: "notFound" as const };

  return {
    success: true,
    data: matches.map((r) => ({
      registrationId: r.registration_id,
      firstName: r.first_name,
      race: { en: r.event?.name_en ?? "", sw: r.event?.name_sw || r.event?.name_en || "" },
      participantCategory: r.participant_category,
      status: r.payment_status,
      fee: expectedFee(r),
      registeredAt: r.created_at,
      confirmedAt: r.payment_confirmed_at,
      collectionVenue: r.collection_venue
        ? { en: r.collection_venue.name_en, sw: r.collection_venue.name_sw || r.collection_venue.name_en }
        : null,
    })),
  };
}
