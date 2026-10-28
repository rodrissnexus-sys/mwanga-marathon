import { describe, expect, it } from "vitest";
import { expectedFee, formatMoney } from "@/lib/payments";

const event = { is_kids_event: false, local_price: 40000, foreign_price: 30, local_kids_price: 20000 };

describe("expectedFee", () => {
  it("charges Tanzanians, East Africans and SADC residents the local price", () => {
    expect(expectedFee({ nationality_category: "tz_ea", event })).toEqual({ amount: 40000, currency: "TZS" });
    expect(expectedFee({ nationality_category: "tz_resident_sadc", event })).toEqual({ amount: 40000, currency: "TZS" });
  });

  it("charges everyone else the foreign price in USD", () => {
    expect(expectedFee({ nationality_category: "international", event })).toEqual({ amount: 30, currency: "USD" });
  });

  it("falls back to the nationality for imported rows without a category", () => {
    expect(expectedFee({ nationality: { code: "TZA" }, event })).toEqual({ amount: 40000, currency: "TZS" });
    expect(expectedFee({ nationality: { code: "KEN" }, event })).toEqual({ amount: 30, currency: "USD" });
  });

  it("uses the kids price for the kids race, whatever the nationality", () => {
    const kids = { ...event, is_kids_event: true };
    expect(expectedFee({ nationality_category: "international", event: kids })).toEqual({ amount: 20000, currency: "TZS" });
  });

  it("has no fee without a race", () => {
    expect(expectedFee({ nationality_category: "tz_ea" })).toBeNull();
  });
});

describe("formatMoney", () => {
  it("formats amounts with their currency", () => {
    expect(formatMoney(40000, "TZS")).toBe("TZS 40,000");
    expect(formatMoney("30.00", "USD")).toBe("USD 30");
    expect(formatMoney(null, "TZS")).toBe("—");
  });
});
