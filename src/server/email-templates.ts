import "server-only";

type Locale = "en" | "sw";

export type RegistrationEmailData = {
  name: string;
  email: string;
  phone: string;
  registrationId: string;
  event: string;
  /** entry fee to pay (see expectedFee) */
  fee: { amount: number; currency: "TZS" | "USD" } | null;
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

// Brand colours (same as the website theme) and absolute links for email clients.
const NAVY = "#221751";
const LIME = "#bffc00";
const SITE = "https://mwafem.com";
const LOGO = `${SITE}/assets/logo/logo.png`;
const FONT = "font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const localePath = (locale: Locale, path: string) => `${SITE}${locale === "sw" ? "/sw" : ""}${path}`;

/**
 * Shared frame: navy header with the logo, white card, navy footer.
 * Table-based with inline styles so it renders the same in Gmail, Outlook and phone mail apps.
 */
function layout(opts: { preheader: string; title: string; subtitle?: string; body: string; locale: Locale }) {
  const t = TEXT[opts.locale];
  return `<!doctype html><html lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#eceef4;${FONT};color:#1f1d2b">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceef4"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td align="center" style="background:${NAVY};padding:28px 24px 0">
  <a href="${localePath(opts.locale, "/")}"><img src="${LOGO}" width="150" alt="Mwanga Festival &amp; Marathon" style="display:block;width:150px;max-width:60%;height:auto;border:0;color:#ffffff;font-size:18px;font-weight:bold"></a>
  <h1 style="margin:20px 0 6px;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800">${escape(opts.title)}</h1>
  ${opts.subtitle ? `<p style="margin:0;color:#d6d3e6;font-size:15px;line-height:1.5">${escape(opts.subtitle)}</p>` : ""}
  <div style="height:24px"></div>
</td></tr>
<tr><td style="height:5px;background:${LIME};font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:28px 24px;font-size:15px;line-height:1.6">${opts.body}</td></tr>
<tr><td align="center" style="background:${NAVY};padding:24px;color:#d6d3e6;font-size:13px;line-height:1.7">
  <strong style="color:${LIME};font-size:14px">${escape(t.raceDay)}</strong><br>
  <a href="mailto:info@mwafem.com" style="color:#ffffff;text-decoration:none">info@mwafem.com</a> &nbsp;·&nbsp;
  <a href="tel:+255755002886" style="color:#ffffff;text-decoration:none">+255 755 002 886</a><br>
  <a href="https://www.instagram.com/mwangafestivalandmarathon/" style="color:#ffffff">Instagram</a> &nbsp;·&nbsp;
  <a href="https://web.facebook.com/profile.php?id=61566560950056" style="color:#ffffff">Facebook</a> &nbsp;·&nbsp;
  <a href="${localePath(opts.locale, "/")}" style="color:#ffffff">mwafem.com</a>
</td></tr>
</table>
<p style="margin:16px 0 0;color:#8a8799;font-size:12px">${escape(t.footerNote)}</p>
</td></tr></table></body></html>`;
}

const heading = (text: string) =>
  `<h2 style="margin:28px 0 10px;color:${NAVY};font-size:17px;font-weight:800"><span style="display:inline-block;width:4px;height:16px;background:${LIME};border-radius:2px;margin-right:8px;vertical-align:-2px"></span>${escape(text)}</h2>`;

const rows = (pairs: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f7f7fb;border-radius:10px">${pairs
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:10px 14px;color:#6b6880;font-size:14px;width:42%;${i ? "border-top:1px solid #e6e5ee;" : ""}">${escape(k)}</td><td style="padding:10px 14px;color:#1f1d2b;font-size:14px;font-weight:600;${i ? "border-top:1px solid #e6e5ee;" : ""}">${escape(v || "—")}</td></tr>`,
    )
    .join("")}</table>`;

// Big registration number "ticket" with a status pill.
const ticket = (label: string, id: string, status: { text: string; bg: string; fg: string }) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed ${NAVY};border-radius:12px;background:#f6f4ff"><tr><td align="center" style="padding:18px 12px">
  <div style="color:#6b6880;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">${escape(label)}</div>
  <div style="margin:6px 0 10px;color:${NAVY};font-size:26px;font-weight:800;letter-spacing:1px;font-family:Consolas,'Courier New',monospace">${escape(id)}</div>
  <span style="display:inline-block;padding:5px 14px;border-radius:999px;background:${status.bg};color:${status.fg};font-size:13px;font-weight:700">${escape(status.text)}</span>
</td></tr></table>`;

const button = (href: string, text: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 4px"><tr><td align="center" style="border-radius:10px;background:${NAVY}">
  <a href="${href}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px">${escape(text)} &rarr;</a></td></tr></table>`;

const PAYMENT_METHODS = [
  { name: "M-PESA", lines: ["*150*00#", "Lipa Namba: 58136742"] },
  { name: "MIXX BY YAS", lines: ["*150*01#", "Lipa Namba: 18403062"] },
  { name: "BANK / BENKI", lines: ["Mwanga Hakika Bank: 2290060000001", "CRDB: 015C948979800", "TCB: 215404000076", "Kisangara Tours Ltd"] },
];

function paymentBox(d: RegistrationEmailData, t: (typeof TEXT)[Locale]) {
  const methods = PAYMENT_METHODS.map(
    (m) =>
      `<tr><td style="padding:10px 14px;border-top:1px solid #e3ecc2"><strong style="color:${NAVY};font-size:13px;letter-spacing:.5px">${m.name}</strong><br><span style="color:#3b3950;font-size:14px">${m.lines.map(escape).join("<br>")}</span></td></tr>`,
  ).join("");
  return `${heading(t.howToPay)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8ffe0;border:1px solid #dbeea0;border-radius:12px">
<tr><td style="padding:14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="color:#3b3950;font-size:14px">${escape(t.amountToPay)}</td>
    <td align="right" style="color:${NAVY};font-size:20px;font-weight:800">${escape(fee(d))}</td>
  </tr></table>
  <p style="margin:8px 0 0;color:#3b3950;font-size:14px">${escape(t.useReference)} <strong style="color:${NAVY};font-family:Consolas,'Courier New',monospace">${escape(d.registrationId)}</strong></p>
</td></tr>
${methods}
<tr><td style="padding:12px 14px;border-top:1px solid #e3ecc2;color:#3b3950;font-size:13px">${escape(t.sendSlip)}</td></tr>
</table>`;
}

const TEXT = {
  en: {
    welcomeSubject: "You're registered for Mwanga Marathon 2026 🏃",
    welcomeTitle: "You're registered!",
    welcomeSub: "Welcome to Mwanga Festival & Marathon 2026",
    preheader: (id: string) => `Your registration number is ${id}. Pay your entry fee to confirm your place.`,
    hello: (name: string) => `Hi ${name},`,
    intro: "Thank you for registering for the Mwanga Festival & Marathon. We're excited to have you with us! Here is your registration number — keep it, you'll need it to pay and to collect your race kit.",
    yourNumber: "Your registration number",
    awaiting: "Awaiting payment",
    confirmed: "Confirmed",
    howToPay: "Pay to confirm your place",
    amountToPay: "Amount to pay",
    useReference: "Use your registration number as the payment reference:",
    sendSlip: "Then send the payment slip or message to info@mwafem.com or 0755 002 886. We'll email you as soon as it's confirmed (usually within 24 hours).",
    details: "Your registration", personal: "Your details", emergency: "Emergency contact",
    registrationId: "Registration number", event: "Race", shirt: "T-shirt size", venue: "Kit collection",
    fee: "Entry fee", name: "Name", email: "Email", phone: "Phone", gender: "Gender",
    nationality: "Nationality", country: "Country", contactName: "Name", contactNumber: "Phone",
    checkStatus: "Check my registration",
    important: "Good to know",
    notes: ["Bring a valid ID when you collect your race kit.", "Race day: Sunday 20 December 2026, start 6:00 AM at C.D. Msuya Stadium, Mwanga.", "Follow us on Instagram and Facebook for updates."],
    paidSubject: "Payment confirmed — see you on race day! ✅",
    paidTitle: "Your place is confirmed!",
    paidSub: "Payment received — see you at the start line",
    paidPreheader: (id: string) => `We received your payment for ${id}. Your place is confirmed.`,
    paidText: (event: string) => `Great news — we have received your payment for ${event}. Your place is confirmed. Now it's time to train!`,
    confirmedOn: "Confirmed on",
    nextSteps: "What's next",
    paidNotes: ["Collect your race kit (bib number and T-shirt) at your chosen venue — bring a valid ID and this registration number.", "Kit collection dates will be announced on our website and social media.", "Race day: Sunday 20 December 2026, start 6:00 AM at C.D. Msuya Stadium, Mwanga."],
    raceDay: "20 December 2026 · C.D. Msuya Stadium, Mwanga",
    footerNote: "You received this email because you registered on mwafem.com.",
  },
  sw: {
    welcomeSubject: "Umesajiliwa Mwanga Marathon 2026 🏃",
    welcomeTitle: "Umesajiliwa!",
    welcomeSub: "Karibu Mwanga Festival & Marathon 2026",
    preheader: (id: string) => `Namba yako ya usajili ni ${id}. Lipa ada ili kuthibitisha nafasi yako.`,
    hello: (name: string) => `Habari ${name},`,
    intro: "Asante kwa kujisajili kwa Mwanga Festival & Marathon. Tunafurahi sana kuwa nawe! Hii ndiyo namba yako ya usajili — itunze, utaihitaji kulipa na kuchukua vifaa vya mbio.",
    yourNumber: "Namba yako ya usajili",
    awaiting: "Inasubiri malipo",
    confirmed: "Imethibitishwa",
    howToPay: "Lipa ili kuthibitisha nafasi yako",
    amountToPay: "Kiasi cha kulipa",
    useReference: "Tumia namba yako ya usajili kama kumbukumbu ya malipo:",
    sendSlip: "Kisha tuma risiti au ujumbe wa malipo kwa info@mwafem.com au 0755 002 886. Tutakutumia barua pepe malipo yakithibitishwa (kwa kawaida ndani ya saa 24).",
    details: "Usajili wako", personal: "Taarifa zako", emergency: "Mawasiliano ya dharura",
    registrationId: "Namba ya usajili", event: "Mbio", shirt: "Ukubwa wa T-shirt", venue: "Kuchukua vifaa",
    fee: "Ada ya ushiriki", name: "Jina", email: "Barua pepe", phone: "Simu", gender: "Jinsia",
    nationality: "Utaifa", country: "Nchi", contactName: "Jina", contactNumber: "Simu",
    checkStatus: "Angalia usajili wangu",
    important: "Ni vizuri kujua",
    notes: ["Leta kitambulisho halali unapochukua vifaa vya mbio.", "Siku ya mbio: Jumapili 20 Desemba 2026, kuanza saa 12:00 asubuhi, Uwanja wa C.D. Msuya, Mwanga.", "Tufuate Instagram na Facebook kwa taarifa mpya."],
    paidSubject: "Malipo yamethibitishwa — tukutane siku ya mbio! ✅",
    paidTitle: "Nafasi yako imethibitishwa!",
    paidSub: "Malipo yamepokelewa — tukutane kwenye mstari wa kuanzia",
    paidPreheader: (id: string) => `Tumepokea malipo ya ${id}. Nafasi yako imethibitishwa.`,
    paidText: (event: string) => `Habari njema — tumepokea malipo yako ya ${event}. Nafasi yako imethibitishwa. Sasa ni wakati wa mazoezi!`,
    confirmedOn: "Imethibitishwa tarehe",
    nextSteps: "Hatua zinazofuata",
    paidNotes: ["Chukua vifaa vya mbio (namba ya kifua na T-shirt) kwenye kituo ulichochagua — leta kitambulisho halali na namba hii ya usajili.", "Tarehe za kuchukua vifaa zitatangazwa kwenye tovuti na mitandao yetu ya kijamii.", "Siku ya mbio: Jumapili 20 Desemba 2026, kuanza saa 12:00 asubuhi, Uwanja wa C.D. Msuya, Mwanga."],
    raceDay: "20 Desemba 2026 · Uwanja wa C.D. Msuya, Mwanga",
    footerNote: "Umepokea barua pepe hii kwa sababu ulijisajili kwenye mwafem.com.",
  },
} as const;

const list = (items: readonly string[]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
    .map((n) => `<tr><td width="26" valign="top" style="padding:4px 0;color:${NAVY};font-weight:800">✓</td><td style="padding:4px 0;color:#3b3950;font-size:14px">${escape(n)}</td></tr>`)
    .join("")}</table>`;

function fee(d: RegistrationEmailData) {
  return d.fee ? money(d.fee.amount, d.fee.currency) : "—";
}

export function registrationConfirmation(d: RegistrationEmailData, locale: Locale) {
  const t = TEXT[locale];
  const body = `
<p style="margin:0 0 12px">${escape(t.hello(d.name))}</p>
<p style="margin:0 0 20px;color:#3b3950">${escape(t.intro)}</p>
${ticket(t.yourNumber, d.registrationId, { text: t.awaiting, bg: "#fff3cd", fg: "#7a5a00" })}
${paymentBox(d, t)}
${heading(t.details)}
${rows([[t.event, d.event], [t.fee, fee(d)], [t.shirt, d.shirtSize], [t.venue, d.collectionVenue]])}
${heading(t.personal)}
${rows([[t.name, d.name], [t.email, d.email], [t.phone, d.phone], [t.gender, d.gender], [t.nationality, d.nationality], [t.country, d.country]])}
${heading(t.emergency)}
${rows([[t.contactName, d.emergencyContactName], [t.contactNumber, d.emergencyContactNumber]])}
${heading(t.important)}
${list(t.notes)}
${button(localePath(locale, "/registration-status"), t.checkStatus)}`;
  return {
    subject: t.welcomeSubject,
    html: layout({ preheader: t.preheader(d.registrationId), title: t.welcomeTitle, subtitle: t.welcomeSub, body, locale }),
  };
}

export function adminNotification(d: RegistrationEmailData, locale: Locale) {
  const body = `
<p style="margin:0 0 16px;color:#3b3950">A new runner registered on the <strong>${locale === "sw" ? "Swahili" : "English"}</strong> site. Their payment is pending — confirm it in the dashboard once the money arrives. Reply to this email to write to the runner.</p>
${ticket("Registration number", d.registrationId, { text: "Awaiting payment", bg: "#fff3cd", fg: "#7a5a00" })}
${heading("Runner")}
${rows([
  ["Name", d.name], ["Email", d.email], ["Phone", d.phone], ["Gender", d.gender],
  ["Nationality", d.nationality], ["Country", d.country],
])}
${heading("Race")}
${rows([["Race", d.event], ["Entry fee", fee(d)], ["T-shirt size", d.shirtSize], ["Kit collection", d.collectionVenue]])}
${heading("Emergency contact")}
${rows([["Name", d.emergencyContactName], ["Phone", d.emergencyContactNumber]])}
${button(`${SITE}/dashboard`, "Open the dashboard")}`;
  return {
    subject: `New registration: ${d.name} (${d.registrationId})`,
    html: layout({ preheader: `${d.name} registered for ${d.event}`, title: "New registration", subtitle: d.event, body, locale: "en" }),
  };
}

export function paymentConfirmed(
  d: { name: string; registrationId: string; event: string; confirmedAt: string },
  locale: Locale,
) {
  const t = TEXT[locale];
  const body = `
<p style="margin:0 0 12px">${escape(t.hello(d.name))}</p>
<p style="margin:0 0 20px;color:#3b3950">${escape(t.paidText(d.event))}</p>
${ticket(t.yourNumber, d.registrationId, { text: `✓ ${t.confirmed}`, bg: "#d9f7e3", fg: "#0f6b34" })}
${heading(t.details)}
${rows([[t.event, d.event], [t.confirmedOn, d.confirmedAt]])}
${heading(t.nextSteps)}
${list(t.paidNotes)}
${button(localePath(locale, "/race-day"), locale === "sw" ? "Taarifa za siku ya mbio" : "Race day information")}`;
  return {
    subject: t.paidSubject,
    html: layout({ preheader: t.paidPreheader(d.registrationId), title: t.paidTitle, subtitle: t.paidSub, body, locale }),
  };
}

export function contactNotification(m: {
  kind: "contact" | "partnership" | "volunteer";
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  company?: string | null;
  website?: string | null;
  sponsorshipTier?: string | null;
}) {
  const title = { partnership: "New partnership request", volunteer: "New volunteer", contact: "New contact message" }[m.kind];
  const html = layout({ preheader: `${m.name}: ${m.message.slice(0, 80)}`, title, subtitle: `${m.name} · ${m.email}`, locale: "en", body: `
<p style="margin:0 0 16px;color:#3b3950">Reply to this email to answer ${escape(m.name)} directly.</p>
${rows([
  ["Name", m.name], ["Email", m.email], ["Phone", m.phone || "—"],
  ...(m.kind === "partnership"
    ? ([["Company", m.company || "—"], ["Website", m.website || "—"], ["Tier", m.sponsorshipTier || "—"]] as [string, string][])
    : ([[m.kind === "volunteer" ? "Wants to help with" : "Subject", m.subject || "—"]] as [string, string][])),
])}
${heading("Message")}
<div style="white-space:pre-wrap;background:#f7f7fb;border-left:4px solid ${LIME};padding:14px;border-radius:8px;color:#1f1d2b">${escape(m.message)}</div>
${button(`${SITE}/dashboard/messages`, "Open messages in the dashboard")}` });
  return { subject: `${title}: ${m.kind === "partnership" ? m.company || m.name : m.subject || m.name}`, html };
}
