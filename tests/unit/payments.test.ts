import { describe, expect, it } from "vitest";
import { ageOnRaceDay, categoriesForAge, expectedFee, formatMoney } from "@/lib/payments";

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

describe("2026 participant categories", () => {
  it("works out the age on race day (20 December 2026)", () => {
    expect(ageOnRaceDay("2016-12-20")).toBe(10);
    expect(ageOnRaceDay("2016-12-21")).toBe(9);
    expect(ageOnRaceDay("1961-12-20")).toBe(65);
    expect(ageOnRaceDay("")).toBeNull();
  });

  it("limits the choice by age", () => {
    expect(categoriesForAge(10)).toEqual(["child"]);
    expect(categoriesForAge(11)).toEqual(["adult", "club", "student"]);
    expect(categoriesForAge(64)).toEqual(["adult", "club", "student"]);
    expect(categoriesForAge(65)).toEqual(["senior"]);
  });

  it("prices by category, whatever the race", () => {
    const fee = (participant_category: string, nationality_category = "tz_ea") =>
      expectedFee({ participant_category, nationality_category, event });
    expect(fee("adult")).toEqual({ amount: 40000, currency: "TZS" });
    expect(fee("club")).toEqual({ amount: 35000, currency: "TZS" });
    expect(fee("student")).toEqual({ amount: 25000, currency: "TZS" });
    expect(fee("child")).toEqual({ amount: 15000, currency: "TZS" });
    expect(fee("senior")).toEqual({ amount: 15000, currency: "TZS" });
  });

  it("charges visitors from outside East Africa and SADC USD 30, except children and elders", () => {
    expect(expectedFee({ participant_category: "student", nationality_category: "international" })).toEqual({ amount: 30, currency: "USD" });
    expect(expectedFee({ participant_category: "child", nationality_category: "international" })).toEqual({ amount: 15000, currency: "TZS" });
  });
});

describe("formatMoney", () => {
  it("formats amounts with their currency", () => {
    expect(formatMoney(40000, "TZS")).toBe("TZS 40,000");
    expect(formatMoney("30.00", "USD")).toBe("USD 30");
    expect(formatMoney(null, "TZS")).toBe("—");
  });
});
