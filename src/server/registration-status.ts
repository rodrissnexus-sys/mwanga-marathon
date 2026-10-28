"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { expectedFee } from "@/lib/payments";

const schema = z.object({
  registrationId: z.string().trim().min(5).max(40),
  phone: z.string().trim().min(6).max(30),
});

// Phone numbers are compared on their last 9 digits, so 0755 002 886,
// +255755002886 and 255 755 002 886 all match.
const phoneKey = (phone: string) => phone.replace(/\D/g, "").slice(-9);

/**
 * Public "check my registration": the registration ID together with the phone
 * number used to register. Returns only what the participant needs (no
 * personal details), and the same "not found" answer whichever part is wrong.
 * 10 lookups per IP per 10 minutes.
 */
export async function lookupRegistration(input: z.input<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "notFound" as const };

  const supabase = createAdminClient();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { data: allowed } = await supabase.rpc("hit_rate_limit", {
    p_key: `status:${ip}`,
    p_max: 10,
    p_window_seconds: 600,
  });
  if (!allowed) return { success: false, error: "tooMany" as const };

  const { data: r } = await supabase
    .from("registrations")
    .select(`registration_id, first_name, phone_number, participant_category, nationality_category,
      payment_status, payment_confirmed_at, created_at,
      event:events(name_en, name_sw, is_kids_event, local_price, foreign_price, local_kids_price),
      nationality:countries!registrations_nationality_id_fkey(code),
      collection_venue:collection_venues(name_en, name_sw)`)
    .ilike("registration_id", parsed.data.registrationId.replace(/[\\%_]/g, (c) => `\\${c}`))
    .is("deleted_at", null)
    .maybeSingle();

  const key = phoneKey(parsed.data.phone);
  if (!r || key.length < 6 || phoneKey(r.phone_number) !== key) {
    return { success: false, error: "notFound" as const };
  }

  return {
    success: true,
    data: {
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
    },
  };
}
