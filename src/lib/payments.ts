// Fee rules shared by the dashboard, the receipts and the server actions.

type FeeEvent = {
  is_kids_event?: boolean | null;
  local_price?: number | string | null;
  foreign_price?: number | string | null;
  local_kids_price?: number | string | null;
};

type FeeRegistration = {
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

/** Local rate for Tanzanians, East Africans and SADC residents; USD for everyone else. */
export function isLocalEntrant(registration: FeeRegistration) {
  return registration.nationality_category
    ? registration.nationality_category !== "international"
    : registration.nationality?.code === "TZA";
}

/** The race fee this participant should have paid. */
export function expectedFee(registration: FeeRegistration): Fee | null {
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
