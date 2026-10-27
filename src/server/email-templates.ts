import "server-only";

type Locale = "en" | "sw";

export type RegistrationEmailData = {
  name: string;
  email: string;
  phone: string;
  registrationId: string;
  event: string;
  isKidsEvent: boolean;
  isLocal: boolean;
  localPrice: number;
  foreignPrice: number;
  localKidsPrice: number;
  shirtSize: string;
  collectionVenue: string;
  gender: string;
  nationality: string;
  country: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
};

const escape = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const money = (amount: number, currency: "TZS" | "USD") =>
  `${currency} ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1f1f1f">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#221751;color:#ffffff;padding:24px;font-size:22px;font-weight:bold">${escape(title)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="background:#221751;color:#bffc00;padding:16px;font-size:12px;text-align:center">
Mwanga Festival &amp; Marathon · info@mwafem.com · +255 755 002 886</td></tr>
</table></td></tr></table></body></html>`;
}

const rows = (pairs: [string, string][]) =>
  `<table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin:12px 0">${pairs
    .map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;color:#555;width:45%">${escape(k)}</td><td style="border-bottom:1px solid #eee"><strong>${escape(v)}</strong></td></tr>`)
    .join("")}</table>`;

const TEXT = {
  en: {
    welcomeSubject: "Welcome to Mwanga Festival & Marathon!",
    welcomeTitle: "Welcome to Mwanga Festival & Marathon!",
    hello: (name: string) => `Dear ${name},`,
    intro: "Thank you for registering for the Mwanga Festival & Marathon. We're excited to have you join us! Below are your registration details.",
    details: "Registration Details", personal: "Personal Information", emergency: "Emergency Contact",
    registrationId: "Registration ID", event: "Event", shirt: "T-shirt size", venue: "Collection venue",
    fee: "Entry fee", name: "Name", email: "Email", phone: "Phone", gender: "Gender",
    nationality: "Nationality", country: "Country", contactName: "Contact name", contactNumber: "Contact number",
    payment: "Your registration will be confirmed once your payment is received. Payment options are on the Register page of our website.",
    important: "Important information",
    notes: ["Please keep this email for your records", "Bring a valid ID when collecting your race kit", "Follow us on social media for updates"],
    paidSubject: "Payment Confirmed for Mwanga Festival & Marathon!",
    paidTitle: "Payment confirmed",
    paidText: (event: string) => `We have received your payment for ${event}. Your place is confirmed — see you at the start line!`,
    confirmedOn: "Confirmed on",
  },
  sw: {
    welcomeSubject: "Karibu Mwanga Festival & Marathon!",
    welcomeTitle: "Karibu Mwanga Festival & Marathon!",
    hello: (name: string) => `Ndugu ${name},`,
    intro: "Asante kwa kujisajili kwa Mwanga Festival & Marathon. Tunafurahi sana kuwa nawe! Hapa chini kuna maelezo ya usajili wako.",
    details: "Maelezo ya Usajili", personal: "Taarifa Binafsi", emergency: "Mawasiliano ya Dharura",
    registrationId: "Namba ya Usajili", event: "Tukio", shirt: "Ukubwa wa T-shirt", venue: "Kituo cha kuchukulia",
    fee: "Ada ya ushiriki", name: "Jina", email: "Barua pepe", phone: "Simu", gender: "Jinsia",
    nationality: "Utaifa", country: "Nchi", contactName: "Jina la mtu wa dharura", contactNumber: "Namba ya mtu wa dharura",
    payment: "Usajili wako utathibitishwa mara malipo yako yatakapopokelewa. Njia za malipo ziko kwenye ukurasa wa Jiandikishe wa tovuti yetu.",
    important: "Taarifa muhimu",
    notes: ["Tafadhali hifadhi barua pepe hii kwa kumbukumbu", "Leta kitambulisho halali unapochukua vifaa vya mbio", "Tufuate kwenye mitandao ya kijamii kwa taarifa mpya"],
    paidSubject: "Malipo Yamethibitishwa — Mwanga Festival & Marathon!",
    paidTitle: "Malipo yamethibitishwa",
    paidText: (event: string) => `Tumepokea malipo yako ya ${event}. Nafasi yako imethibitishwa — tukutane kwenye mstari wa kuanzia!`,
    confirmedOn: "Imethibitishwa tarehe",
  },
} as const;

function fee(d: RegistrationEmailData) {
  if (d.isKidsEvent) return money(d.localKidsPrice, "TZS");
  return d.isLocal ? money(d.localPrice, "TZS") : money(d.foreignPrice, "USD");
}

export function registrationConfirmation(d: RegistrationEmailData, locale: Locale) {
  const t = TEXT[locale];
  const html = layout(t.welcomeTitle, `
<p>${escape(t.hello(d.name))}</p><p>${escape(t.intro)}</p>
<h3 style="color:#221751">${escape(t.details)}</h3>
${rows([[t.registrationId, d.registrationId], [t.event, d.event], [t.shirt, d.shirtSize], [t.venue, d.collectionVenue], [t.fee, fee(d)]])}
<h3 style="color:#221751">${escape(t.personal)}</h3>
${rows([[t.name, d.name], [t.email, d.email], [t.phone, d.phone], [t.gender, d.gender], [t.nationality, d.nationality], [t.country, d.country]])}
<h3 style="color:#221751">${escape(t.emergency)}</h3>
${rows([[t.contactName, d.emergencyContactName], [t.contactNumber, d.emergencyContactNumber]])}
<p style="background:#f6ffd6;padding:12px;border-radius:6px">${escape(t.payment)}</p>
<h3 style="color:#221751">${escape(t.important)}</h3>
<ul>${t.notes.map((n) => `<li>${escape(n)}</li>`).join("")}</ul>`);
  return { subject: t.welcomeSubject, html };
}

export function adminNotification(d: RegistrationEmailData, locale: Locale) {
  const html = layout("New registration", `
<p>A new participant registered on the ${locale === "sw" ? "Swahili" : "English"} site.</p>
${rows([
  ["Registration ID", d.registrationId], ["Name", d.name], ["Email", d.email], ["Phone", d.phone],
  ["Event", d.event], ["Entry fee", fee(d)], ["T-shirt size", d.shirtSize], ["Collection venue", d.collectionVenue],
  ["Gender", d.gender], ["Nationality", d.nationality], ["Country", d.country],
  ["Emergency contact", `${d.emergencyContactName} (${d.emergencyContactNumber})`],
])}`);
  return { subject: `New Registration: ${d.name}`, html };
}

export function paymentConfirmed(
  d: { name: string; registrationId: string; event: string; confirmedAt: string },
  locale: Locale,
) {
  const t = TEXT[locale];
  const html = layout(t.paidTitle, `
<p>${escape(t.hello(d.name))}</p><p>${escape(t.paidText(d.event))}</p>
${rows([[t.registrationId, d.registrationId], [t.event, d.event], [t.confirmedOn, d.confirmedAt]])}`);
  return { subject: t.paidSubject, html };
}

export function contactNotification(m: {
  kind: "contact" | "partnership";
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  company?: string | null;
  website?: string | null;
  sponsorshipTier?: string | null;
}) {
  const title = m.kind === "partnership" ? "New partnership request" : "New contact message";
  const html = layout(title, `
${rows([
  ["Name", m.name], ["Email", m.email], ["Phone", m.phone || "—"],
  ...(m.kind === "partnership"
    ? ([["Company", m.company || "—"], ["Website", m.website || "—"], ["Tier", m.sponsorshipTier || "—"]] as [string, string][])
    : ([["Subject", m.subject || "—"]] as [string, string][])),
])}
<p style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:6px">${escape(m.message)}</p>`);
  return { subject: `${title}: ${m.kind === "partnership" ? m.company || m.name : m.subject || m.name}`, html };
}
