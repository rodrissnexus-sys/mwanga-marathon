import { describe, expect, it } from "vitest";
import { contactMessageSchema, registrationSchema } from "@/lib/validation";

const validRegistration = {
  first_name: "Neema",
  last_name: "Mushi",
  email: "neema@example.com",
  phone_number: "+255700000000",
  event_id: "2",
  shirt_size_id: 1,
  kids_shirt_size_id: "",
  collection_venue_id: 1,
  nationality_id: 1,
  nationality_category: "tz_ea",
  id_number: "",
  passport_number: "",
  date_of_birth: "1995-04-12",
  gender_id: 2,
  country_id: 1,
  emergency_contact_name: "Baraka Mushi",
  emergency_contact_number: "+255711111111",
  postal_code: "",
  voucher_code: "",
  participant_category: "adult",
};

describe("registrationSchema", () => {
  it("accepts a complete registration and normalises empty optional fields", () => {
    const result = registrationSchema.parse(validRegistration);
    expect(result.event_id).toBe(2);
    expect(result.kids_shirt_size_id).toBeNull();
    expect(result.id_number).toBeNull();
    expect(result.voucher_code).toBeNull();
  });

  it.each([
    ["first_name", ""],
    ["email", "not-an-email"],
    ["phone_number", "1".repeat(21)],
    ["event_id", "abc"],
    ["date_of_birth", "12/04/1995"],
    ["nationality_category", "martian"],
    ["voucher_code", "x".repeat(51)],
  ])("rejects an invalid %s", (field, value) => {
    const result = registrationSchema.safeParse({ ...validRegistration, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path[0]).toBe(field);
  });

  it("requires a participant type that fits the age on race day", () => {
    const parse = (date_of_birth: string, participant_category: string) =>
      registrationSchema.safeParse({ ...validRegistration, date_of_birth, participant_category }).success;
    expect(parse("1995-04-12", "student")).toBe(true);
    expect(parse("1995-04-12", "child")).toBe(false);
    expect(parse("2018-01-01", "child")).toBe(true); // 8 on race day
    expect(parse("2018-01-01", "adult")).toBe(false);
    expect(parse("1950-01-01", "senior")).toBe(true);
    expect(parse("1950-01-01", "adult")).toBe(false);
    expect(parse("1995-04-12", "vip")).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { emergency_contact_name: _omit, ...rest } = validRegistration;
    expect(registrationSchema.safeParse(rest).success).toBe(false);
  });
});

describe("contactMessageSchema", () => {
  it("accepts a contact message", () => {
    const ok = contactMessageSchema.safeParse({
      kind: "contact", name: "Asha", email: "asha@example.com", phone: "", subject: "Hi", message: "Hello",
    });
    expect(ok.success).toBe(true);
  });

  it("requires company and a known tier for partnership requests", () => {
    const base = { kind: "partnership", name: "Asha", email: "asha@example.com", message: "We'd like to sponsor" };
    expect(contactMessageSchema.safeParse({ ...base, company: "Acme", sponsorship_tier: "gold" }).success).toBe(true);
    expect(contactMessageSchema.safeParse({ ...base, sponsorship_tier: "gold" }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...base, company: "Acme", sponsorship_tier: "diamond" }).success).toBe(false);
  });
});
