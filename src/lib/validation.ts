import { z } from "zod";

// Validation for the public forms. Shared by the server actions and the tests.

const id = z.coerce.number().int().positive();
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullish());

// Mirrors the Laravel validation rules for /marathon/register.
export const registrationSchema = z.object({
  first_name: z.string().trim().min(1).max(255),
  last_name: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone_number: z.string().trim().min(1).max(20),
  event_id: id,
  shirt_size_id: id,
  kids_shirt_size_id: z.preprocess((v) => (v === "" ? null : v), id.nullish()),
  collection_venue_id: id,
  nationality_id: id,
  nationality_category: z.enum(["tz_ea", "tz_resident_sadc", "international"]).nullish(),
  id_number: optionalText(50),
  passport_number: optionalText(50),
  date_of_birth: z.iso.date(),
  gender_id: id,
  country_id: id,
  emergency_contact_name: z.string().trim().min(1).max(255),
  emergency_contact_number: z.string().trim().min(1).max(20),
  postal_code: optionalText(20),
  voucher_code: optionalText(50),
});

const contactSchema = z.object({
  kind: z.literal("contact"),
  name: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: optionalText(30),
  subject: z.string().trim().min(1).max(255),
  message: z.string().trim().min(1).max(5000),
});

const partnershipSchema = z.object({
  kind: z.literal("partnership"),
  name: z.string().trim().min(1).max(255),
  email: z.email().max(255),
  phone: optionalText(30),
  company: z.string().trim().min(1).max(255),
  website: optionalText(255),
  sponsorship_tier: z.enum(["tanzanite", "platinum", "gold", "silver", "custom"]),
  message: z.string().trim().min(1).max(5000),
});

export const contactMessageSchema = z.discriminatedUnion("kind", [contactSchema, partnershipSchema]);

