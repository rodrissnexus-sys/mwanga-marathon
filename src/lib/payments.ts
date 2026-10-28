// Fee rules shared by the registration form, the dashboard, the receipts and
// the server actions.
import { EVENT } from "@/lib/event";

type FeeEvent = {
  is_kids_event?: boolean | null;
  local_price?: number | string | null;
  foreign_price?: number | string | null;
  local_kids_price?: number | string | null;
};

type FeeRegistration = {
  participant_category?: string | null;
  nationality_category?: string | null;
  nationality?: { code?: string | null } | null;
  event?: FeeEvent | null;
};

export type Fee = { amount: number; currency: "TZS" | "USD" };

export const PAYMENT_METHODS = {
  mobile_money: "Mobile money",
  bank_transfer: "Bank transfer",
  cash: "Cash",
  other: "Other",
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

// 2026 entry fees in TZS (organiser's letter of 15 October 2026). Visitors
// from outside East Africa and SADC pay FOREIGN_FEE instead, except children
// and elders.
export const PARTICIPANT_CATEGORIES = ["adult", "club", "student", "child", "senior"] as const;
export type ParticipantCategory = (typeof PARTICIPANT_CATEGORIES)[number];

export const CATEGORY_FEES: Record<ParticipantCategory, number> = {
  adult: 40000, // adults and youth, 11 to 64
  club: 35000, // jogging and running club members
  student: 25000, // school, college and university students
  child: 15000, // 5 to 10
  senior: 15000, // 65 and over
};

// dashboard labels (staff pages are in English)
export const CATEGORY_LABELS: Record<ParticipantCategory, string> = {
  adult: "Adult / youth (11–64)",
  club: "Running club member",
  student: "Student",
  child: "Child (5–10)",
  senior: "Elder (65+)",
};

export const FOREIGN_FEE: Fee = { amount: 30, currency: "USD" };

export const CHILD_MAX_AGE = 10;
export const SENIOR_MIN_AGE = 65;

/** Age in whole years on race day, or null for a missing/invalid date. */
export function ageOnRaceDay(dateOfBirth: string | null | undefined, raceDay = EVENT.startsAt.slice(0, 10)) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth ?? "");
  if (!match) return null;
  const [y, m, d] = match.slice(1).map(Number);
  const [ry, rm, rd] = raceDay.split("-").map(Number);
  return ry - y - (rm < m || (rm === m && rd < d) ? 1 : 0);
}

/** The categories someone of this age can register in. */
export function categoriesForAge(age: number | null): ParticipantCategory[] {
  if (age === null) return [];
  if (age <= CHILD_MAX_AGE) return ["child"];
  if (age >= SENIOR_MIN_AGE) return ["senior"];
  return ["adult", "club", "student"];
}

/** Local rate for Tanzanians, East Africans and SADC residents; USD for everyone else. */
export function isLocalEntrant(registration: FeeRegistration) {
  return registration.nationality_category
    ? registration.nationality_category !== "international"
    : registration.nationality?.code === "TZA";
}

/** Fee for a category: children and elders always pay the local rate. */
export function categoryFee(category: ParticipantCategory, local: boolean): Fee {
  if (!local && category !== "child" && category !== "senior") return FOREIGN_FEE;
  return { amount: CATEGORY_FEES[category], currency: "TZS" };
}

/** The entry fee this participant should have paid. */
export function expectedFee(registration: FeeRegistration): Fee | null {
  const category = registration.participant_category as ParticipantCategory | null | undefined;
  if (category && category in CATEGORY_FEES) return categoryFee(category, isLocalEntrant(registration));

  // registrations from before the 2026 categories: priced by race
  const event = registration.event;
  if (!event) return null;
  if (event.is_kids_event) return { amount: Number(event.local_kids_price ?? 0), currency: "TZS" };
  if (isLocalEntrant(registration)) return { amount: Number(event.local_price ?? 0), currency: "TZS" };
  return { amount: Number(event.foreign_price ?? 0), currency: "USD" };
}

export function formatMoney(amount: number | string | null | undefined, currency: string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") return "—";
  return `${currency ?? ""} ${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}`.trim();
}
