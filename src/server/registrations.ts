"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { registrationSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthError, requireStaff } from "./auth";
import { ADMIN_EMAIL, sendEmail } from "./email";
import {
  adminNotification,
  paymentConfirmed,
  registrationConfirmation,
  type RegistrationEmailData,
} from "./email-templates";

// Same limits as the old Laravel API (RateLimitFormSubmission).
const MAX_SUBMISSIONS = 3;
const WINDOW_SECONDS = 5 * 60;

export type RegistrationInput = z.input<typeof registrationSchema>;

const RELATIONS = `*,
  event:events(*),
  shirt_size:shirt_sizes!registrations_shirt_size_id_fkey(*),
  kids_shirt_size:shirt_sizes!registrations_kids_shirt_size_id_fkey(*),
  collection_venue:collection_venues(*),
  nationality:countries!registrations_nationality_id_fkey(*),
  country:countries!registrations_country_id_fkey(*),
  gender:genders(*)`;

type Locale = "en" | "sw";
const pickLang = (row: Record<string, unknown> | null, field: string, locale: Locale) =>
  String((locale === "sw" && row?.[`${field}_sw`]) || row?.[`${field}_en`] || "");

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Public registration form. Validates, rate limits, saves, then emails the
 * participant and the organisers in the background.
 *
 * Result shape matches the old API client: { success, data } or
 * { success: false, error, validationErrors? | retryAfter? }.
 */
export async function registerParticipant(input: RegistrationInput, locale: Locale = "en") {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    const validationErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      (validationErrors[field] ??= []).push(issue.message);
    }
    return { success: false, error: "Validation failed", validationErrors };
  }

  const supabase = createAdminClient();
  const { data: allowed, error: limitError } = await supabase.rpc("hit_rate_limit", {
    p_key: `register:${await clientIp()}`,
    p_max: MAX_SUBMISSIONS,
    p_window_seconds: WINDOW_SECONDS,
  });
  if (limitError) {
    console.error("[register] rate limit check failed", limitError);
    return { success: false, error: "Registration failed. Please try again." };
  }
  if (!allowed) {
    return {
      success: false,
      error: "You have exceeded the maximum number of submissions. Please try again later.",
      retryAfter: WINDOW_SECONDS,
    };
  }

  const { data: registration, error } = await supabase
    .from("registrations")
    .insert({ ...parsed.data, locale })
    .select(RELATIONS)
    .single();

  if (error || !registration) {
    // 23503 = a selected option (event, size, venue…) doesn't exist
    if (error?.code === "23503") {
      return { success: false, error: "Validation failed", validationErrors: { form: ["Please re-select your options."] } };
    }
    console.error("[register] insert failed", error);
    return { success: false, error: "Registration failed. Please try again." };
  }

  const r = registration;
  const event = r.event as Record<string, unknown>;
  const emailData: RegistrationEmailData = {
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    phone: r.phone_number,
    registrationId: r.registration_id,
    event: pickLang(event, "name", locale),
    isKidsEvent: Boolean(event?.is_kids_event),
    // Fixes the old check, which compared the country name to "Tanzanian"
    isLocal: r.nationality_category
      ? r.nationality_category !== "international"
      : (r.nationality as { code?: string })?.code === "TZA",
    localPrice: Number(event?.local_price ?? 0),
    foreignPrice: Number(event?.foreign_price ?? 0),
    localKidsPrice: Number(event?.local_kids_price ?? 0),
    shirtSize: pickLang((r.kids_shirt_size ?? r.shirt_size) as Record<string, unknown>, "name", locale),
    collectionVenue: pickLang(r.collection_venue as Record<string, unknown>, "name", locale),
    gender: pickLang(r.gender as Record<string, unknown>, "name", locale),
    nationality: pickLang(r.nationality as Record<string, unknown>, "name", locale),
    country: pickLang(r.country as Record<string, unknown>, "name", locale),
    emergencyContactName: r.emergency_contact_name,
    emergencyContactNumber: r.emergency_contact_number,
  };

  after(async () => {
    const member = registrationConfirmation(emailData, locale);
    const admin = adminNotification(emailData, locale);
    await Promise.all([
      sendEmail({ to: emailData.email, ...member }),
      sendEmail({ to: ADMIN_EMAIL, ...admin, replyTo: emailData.email }),
    ]);
  });

  return { success: true, data: registration };
}

const confirmSchema = z.object({
  method: z.enum(["mobile_money", "bank_transfer", "cash", "other"]),
  reference: z.string().trim().min(3, "Enter the transaction or bank reference.").max(100),
  amount: z.coerce.number().positive("Enter the amount received.").max(100_000_000),
  currency: z.enum(["TZS", "USD"]),
  notes: z.string().trim().max(1000).optional().default(""),
  // set after staff have seen the "reference already used" warning
  allowDuplicate: z.boolean().optional().default(false),
});

const reasonSchema = z.string().trim().min(3, "Please give a short reason.").max(1000);

export type ConfirmPaymentInput = z.input<typeof confirmSchema>;

type PaymentResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  errors?: Record<string, string[]>;
  duplicates?: { id: number; registration_id: string; name: string }[];
};

function paymentFailure(error: unknown, fallback: string): PaymentResult {
  if (error instanceof AuthError) return { success: false, error: error.message };
  // raised by the database guard (a moderator changing a confirmed payment)
  if ((error as { code?: string })?.code === "42501") {
    return { success: false, error: "Only an admin can change a confirmed payment." };
  }
  console.error(`[payments] ${fallback}`, error);
  return { success: false, error: fallback };
}

/**
 * Dashboard: mark a registration as paid (admins and moderators) after
 * matching it with the mobile-money / bank record, and email the participant.
 * Warns (instead of saving) when the reference was already used for another
 * registration, until staff confirm it's intended (e.g. a parent paying for
 * two children in one transfer).
 */
export async function confirmPayment(registrationId: number, input: ConfirmPaymentInput): Promise<PaymentResult> {
  try {
    const { supabase, profile } = await requireStaff();
    const parsed = confirmSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) (errors[String(issue.path[0] ?? "form")] ??= []).push(issue.message);
      return { success: false, error: "Please check the payment details.", errors };
    }
    const { method, reference, amount, currency, notes, allowDuplicate } = parsed.data;

    if (!allowDuplicate) {
      const { data: used, error: usedError } = await supabase
        .from("registrations")
        .select("id, registration_id, first_name, last_name")
        .ilike("payment_reference", reference.replace(/[\\%_]/g, (c) => `\\${c}`))
        .neq("id", registrationId)
        .is("deleted_at", null)
        .limit(5);
      if (usedError) throw usedError;
      if (used.length) {
        return {
          success: false,
          error: "This reference was already used for another registration.",
          duplicates: used.map((r) => ({ id: r.id, registration_id: r.registration_id, name: `${r.first_name} ${r.last_name}` })),
        };
      }
    }

    const { data, error } = await supabase
      .from("registrations")
      .update({
        payment_status: "confirmed",
        payment_confirmed_at: new Date().toISOString(),
        payment_confirmed_by: profile.id,
        payment_confirmed_by_name: profile.name,
        payment_method: method,
        payment_reference: reference,
        payment_amount: amount,
        payment_currency: currency,
        payment_notes: notes || null,
      })
      .eq("id", registrationId)
      .eq("payment_status", "pending") // two staff can't confirm the same payment twice
      .select(RELATIONS)
      .single();
    if (error?.code === "PGRST116") {
      return { success: false, error: "This payment is no longer pending — refresh to see who handled it." };
    }
    if (error || !data) throw error ?? new Error("Registration not found");

    const locale = data.locale as Locale;
    const event = data.event as Record<string, unknown>;
    after(async () => {
      const email = paymentConfirmed(
        {
          name: `${data.first_name} ${data.last_name}`,
          registrationId: data.registration_id,
          event: pickLang(event, "name", locale),
          confirmedAt: new Date(data.payment_confirmed_at!).toLocaleString(locale === "sw" ? "sw-TZ" : "en-GB", {
            timeZone: "Africa/Dar_es_Salaam",
            dateStyle: "long",
            timeStyle: "short",
          }),
        },
        locale,
      );
      await sendEmail({ to: data.email, ...email });
    });

    return { success: true, data };
  } catch (error) {
    return paymentFailure(error, "Failed to confirm payment");
  }
}

/** Dashboard: no matching payment could be found (admins and moderators). */
export async function markPaymentFailed(registrationId: number, reason: string): Promise<PaymentResult> {
  try {
    const { supabase } = await requireStaff();
    const parsed = reasonSchema.safeParse(reason);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const { data, error } = await supabase
      .from("registrations")
      .update({ payment_status: "failed", payment_notes: parsed.data })
      .eq("id", registrationId)
      .eq("payment_status", "pending")
      .select(RELATIONS)
      .single();
    if (error?.code === "PGRST116") {
      return { success: false, error: "This payment is no longer pending — refresh to see who handled it." };
    }
    if (error || !data) throw error ?? new Error("Registration not found");
    return { success: true, data };
  } catch (error) {
    return paymentFailure(error, "Failed to update payment");
  }
}

/**
 * Dashboard: put a payment back to pending — a mistaken confirmation or a
 * late payment after "failed". Undoing a confirmation is admin-only (also
 * enforced by the database); the old details stay in the payment log.
 */
export async function reopenPayment(registrationId: number, reason: string): Promise<PaymentResult> {
  try {
    const { supabase, profile } = await requireStaff();
    const parsed = reasonSchema.safeParse(reason);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const { data: current, error: readError } = await supabase
      .from("registrations")
      .select("payment_status")
      .eq("id", registrationId)
      .single();
    if (readError) throw readError;
    if (current.payment_status === "confirmed" && profile.role !== "admin") {
      return { success: false, error: "Only an admin can change a confirmed payment." };
    }

    const { data, error } = await supabase
      .from("registrations")
      .update({
        payment_status: "pending",
        payment_confirmed_at: null,
        payment_confirmed_by: null,
        payment_confirmed_by_name: null,
        payment_method: null,
        payment_reference: null,
        payment_amount: null,
        payment_currency: null,
        payment_notes: parsed.data,
      })
      .eq("id", registrationId)
      .eq("payment_status", current.payment_status)
      .select(RELATIONS)
      .single();
    if (error || !data) throw error ?? new Error("Registration not found");
    return { success: true, data };
  } catch (error) {
    return paymentFailure(error, "Failed to reopen payment");
  }
}
