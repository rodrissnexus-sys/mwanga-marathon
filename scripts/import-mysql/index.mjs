// Imports the old English and Swahili MySQL databases into Supabase.
//
//   node --env-file=.env.local scripts/import-mysql/index.mjs           # dry run (rolled back)
//   node --env-file=.env.local scripts/import-mysql/index.mjs --commit  # really import
//
// Reads data-import/en.sql and data-import/sw.sql, writes
// data-import/import.sql and data-import/REPORT.md, then runs the SQL with
// psql inside one transaction. Row counts are checked inside the
// transaction; any mismatch aborts everything.
//
// WARNING: replaces all race categories, dropdowns, home-page content,
// banners and registrations in the target database (staff accounts and
// contact messages are kept).

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseDump } from "./parse-dump.mjs";

const DIR = path.resolve(process.env.IMPORT_DIR ?? "data-import");
const COMMIT = process.argv.includes("--commit");
const files = { en: path.join(DIR, "en.sql"), sw: path.join(DIR, "sw.sql") };
for (const file of Object.values(files)) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file} — export the MySQL database there first (see docs/PHASE4.md).`);
    process.exit(1);
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (run with --env-file=.env.local).");
  process.exit(1);
}

const en = parseDump(fs.readFileSync(files.en, "utf8"));
const sw = parseDump(fs.readFileSync(files.sw, "utf8"));
const report = [];
const note = (line = "") => report.push(line);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const rows = (db, table) => [...(db[table] ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
const byId = (list) => new Map(list.map((r) => [r.id, r]));
const same = (a, b) => String(a ?? "").trim() === String(b ?? "").trim();
// Swahili text only when it is filled in and actually differs from English.
const swText = (enValue, swValue) => (swValue && !same(enValue, swValue) ? String(swValue).trim() : null);
const json = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
const timestamp = (value) => (!value || String(value).startsWith("0000-00-00") ? null : `${value}+00`);

function lit(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (Array.isArray(value)) return `ARRAY[${value.map(lit).join(", ")}]::text[]`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

const sql = [];
const expected = {};

function insert(table, columns, list, { explicitId = false } = {}) {
  expected[table] = (expected[table] ?? 0) + list.length;
  for (let i = 0; i < list.length; i += 500) {
    const chunk = list.slice(i, i + 500);
    sql.push(
      `insert into public.${table} (${columns.join(", ")})${explicitId ? " overriding system value" : ""} values\n` +
        chunk.map((row) => `  (${columns.map((c) => lit(row[c])).join(", ")})`).join(",\n") +
        ";",
    );
  }
}

// ---------------------------------------------------------------------------
// lookup tables: English ids are kept, Swahili rows are matched onto them
// ---------------------------------------------------------------------------

const maps = {}; // table -> Map(swId -> newId)

function mergeLookup(table, { match, text, shared, extra = () => ({}) }) {
  const enRows = rows(en, table);
  const swRows = rows(sw, table);
  const out = enRows.map((r) => ({
    id: r.id,
    ...Object.fromEntries(text.map(([src, base]) => [`${base}_en`, r[src] ?? null])),
    ...Object.fromEntries(shared.map((c) => [c, r[c]])),
    ...extra(r),
  }));
  const outById = byId(out);
  const enById = byId(enRows);
  const map = new Map();
  let nextId = Math.max(0, ...enRows.map((r) => r.id)) + 1;
  const onlySw = [];
  let translated = 0;

  for (const s of swRows) {
    const e = match(s, enRows, enById);
    if (e) {
      map.set(s.id, e.id);
      const target = outById.get(e.id);
      for (const [src, base] of text) {
        const value = swText(e[src], s[src]);
        if (value) {
          target[`${base}_sw`] = value;
          translated++;
        }
      }
    } else {
      const id = nextId++;
      map.set(s.id, id);
      onlySw.push(s);
      out.push({
        id,
        ...Object.fromEntries(text.flatMap(([src, base]) => [[`${base}_en`, s[src] ?? null], [`${base}_sw`, s[src] ?? null]])),
        ...Object.fromEntries(shared.map((c) => [c, s[c]])),
        ...extra(s),
      });
    }
  }

  maps[table] = map;
  note(`### ${table}`);
  note(`English ${enRows.length}, Swahili ${swRows.length} → ${out.length} rows; ${translated} Swahili texts added.`);
  if (onlySw.length) {
    note(`Only in the Swahili database (added with the Swahili text as English too — please review):`);
    for (const s of onlySw) note(`- SW id ${s.id}: ${text.map(([src]) => s[src]).filter(Boolean).join(" / ")}`);
  }
  note();
  return out;
}

const byCode = (s, enRows) => enRows.find((e) => same(e.code, s.code));
const byIdIf = (check) => (s, _enRows, enById) => {
  const e = enById.get(s.id);
  return e && check(e, s) ? e : null;
};
const bool = (v) => Boolean(Number(v));

note("# Import report");
note();
note(`Generated ${new Date().toISOString()} — ${COMMIT ? "COMMITTED" : "dry run (rolled back)"}`);
note();
note("## Dropdowns and race categories");
note();

const distanceFromName = (name) => {
  const m = /(\d+(?:\.\d+)?)\s*k(?:m)?\b/i.exec(name ?? "");
  return m ? Number(m[1]) : null;
};

const events = mergeLookup("events", {
  // same id and same prices → same race in both databases
  match: byIdIf((e, s) => Number(e.local_price) === Number(s.local_price) && Number(e.foreign_price) === Number(s.foreign_price)),
  text: [["name", "name"], ["description", "description"]],
  shared: ["local_price", "foreign_price", "local_kids_price", "sort_order"],
  extra: (r) => ({
    is_active: bool(r.is_active),
    distance_km: distanceFromName(r.name),
    is_kids_event: /kid/i.test(r.name ?? ""),
    created_at: timestamp(r.created_at),
    updated_at: timestamp(r.updated_at),
  }),
});
note("Race categories — distance and kids flag were derived from the English names; check them in the dashboard:");
for (const e of events) note(`- ${e.name_en}: ${e.distance_km ?? "no distance"}${e.is_kids_event ? ", kids event" : ""}`);
note();

const shirtSizes = mergeLookup("shirt_sizes", {
  match: byCode,
  text: [["name", "name"]],
  shared: ["code", "sort_order"],
  extra: (r) => ({ is_kids_size: bool(r.is_kids_size), is_active: bool(r.is_active), created_at: timestamp(r.created_at), updated_at: timestamp(r.updated_at) }),
});
const venues = mergeLookup("collection_venues", {
  match: byIdIf((e, s) => same(e.address, s.address)),
  text: [["name", "name"], ["description", "description"]],
  shared: ["address", "sort_order"],
  extra: (r) => ({ is_active: bool(r.is_active), created_at: timestamp(r.created_at), updated_at: timestamp(r.updated_at) }),
});
const countries = mergeLookup("countries", {
  match: byCode,
  text: [["name", "name"], ["nationality", "nationality"]],
  shared: ["code", "sort_order"],
  extra: (r) => ({ is_active: bool(r.is_active), created_at: timestamp(r.created_at), updated_at: timestamp(r.updated_at) }),
});
const genders = mergeLookup("genders", {
  match: byCode,
  text: [["name", "name"]],
  shared: ["code", "sort_order"],
  extra: (r) => ({ is_active: bool(r.is_active), created_at: timestamp(r.created_at), updated_at: timestamp(r.updated_at) }),
});

// ---------------------------------------------------------------------------
// home page content
// ---------------------------------------------------------------------------

note("## Home page content");
note();

function pairChildren(enChildren, swChildren, label) {
  if (swChildren.length && enChildren.length !== swChildren.length) {
    note(`- ${label}: ${enChildren.length} English vs ${swChildren.length} Swahili items — paired by position, please review.`);
  }
  return enChildren.map((e, i) => [e, swChildren[i] ?? null]);
}

const eventTypes = [];
const eventFeatures = [];
{
  const swTypes = rows(sw, "event_types");
  const swFeatures = rows(sw, "event_features");
  const enFeatures = rows(en, "event_features");
  let matched = 0;
  rows(en, "event_types").forEach((e, index) => {
    const s = swTypes.find((t) => same(t.event_id, e.event_id)) ?? null;
    if (s) matched++;
    eventTypes.push({
      id: e.id, slug: e.event_id,
      title_en: e.title, title_sw: swText(e.title, s?.title),
      subtitle_en: e.subtitle, subtitle_sw: swText(e.subtitle, s?.subtitle),
      description_en: e.description, description_sw: swText(e.description, s?.description),
      highlight_en: e.highlight, highlight_sw: swText(e.highlight, s?.highlight),
      icon: e.icon, color: e.color, image: e.image, is_active: bool(e.is_active), sort_order: e.sort_order ?? index,
      created_at: timestamp(e.created_at), updated_at: timestamp(e.updated_at),
    });
    const pairs = pairChildren(
      enFeatures.filter((f) => f.event_type_id === e.id),
      s ? swFeatures.filter((f) => f.event_type_id === s.id) : [],
      `event type "${e.title}" features`,
    );
    for (const [f, sf] of pairs) {
      eventFeatures.push({
        event_type_id: e.id, text_en: f.text, text_sw: swText(f.text, sf?.text), icon: f.icon,
        is_active: bool(f.is_active), sort_order: f.sort_order, created_at: timestamp(f.created_at), updated_at: timestamp(f.updated_at),
      });
    }
  });
  const unmatched = swTypes.filter((t) => !eventTypes.some((e) => same(e.slug, t.event_id)));
  note(`Event program: ${eventTypes.length} types (${matched} with Swahili), ${eventFeatures.length} features.`);
  for (const t of unmatched) note(`- Swahili-only event type "${t.title}" (${t.event_id}) was NOT imported — add it in the dashboard if needed.`);
}

const scheduleDays = [];
const scheduleEvents = [];
{
  const swDays = rows(sw, "schedule_days");
  const swEvents = rows(sw, "schedule_events");
  const enEvents = rows(en, "schedule_events");
  rows(en, "schedule_days").forEach((d, index) => {
    const s =
      (d.day_identifier && swDays.find((x) => same(x.day_identifier, d.day_identifier))) || swDays[index] || null;
    scheduleDays.push({
      id: d.id, day_en: d.day, day_sw: swText(d.day, s?.day), date_en: d.date, date_sw: swText(d.date, s?.date),
      day_identifier: d.day_identifier, is_active: bool(d.is_active), sort_order: d.sort_order ?? index,
      created_at: timestamp(d.created_at), updated_at: timestamp(d.updated_at),
    });
    const pairs = pairChildren(
      enEvents.filter((x) => x.schedule_day_id === d.id),
      s ? swEvents.filter((x) => x.schedule_day_id === s.id) : [],
      `schedule day "${d.day}" events`,
    );
    for (const [x, sx] of pairs) {
      scheduleEvents.push({
        schedule_day_id: d.id, time: x.time,
        title_en: x.title, title_sw: swText(x.title, sx?.title),
        location_en: x.location, location_sw: swText(x.location, sx?.location),
        description_en: x.description, description_sw: swText(x.description, sx?.description),
        icon: x.icon, is_active: bool(x.is_active), sort_order: x.sort_order,
        created_at: timestamp(x.created_at), updated_at: timestamp(x.updated_at),
      });
    }
  });
  note(`Schedule: ${scheduleDays.length} days, ${scheduleEvents.length} events (Swahili days in the dump: ${swDays.length}).`);
}

const banners = [];
const bannerPackages = [];
{
  const legacyPackages = (b) =>
    ["fun_run", "half_marathon", "full_marathon"]
      .filter((c) => b[`${c}_event_id`])
      .map((c) => ({ category: c, event_id: b[`${c}_event_id`], features: json(b[`${c}_features`]) ?? [] }));
  const packagesOf = (b) => {
    const list = json(b.event_packages);
    return Array.isArray(list) && list.length ? list : legacyPackages(b);
  };
  const swBanners = rows(sw, "marathon_banners");
  let activeSeen = false;
  for (const b of rows(en, "marathon_banners")) {
    const s = swBanners.find((x) => same(x.event_date, b.event_date)) ?? swBanners.find((x) => x.id === b.id) ?? null;
    const active = bool(b.is_active) && !activeSeen;
    if (bool(b.is_active) && activeSeen) note(`- Banner "${b.title}" was also active; only one can be — imported as inactive.`);
    activeSeen ||= active;
    banners.push({
      id: b.id, title_en: b.title, title_sw: swText(b.title, s?.title),
      subtitle_en: b.subtitle, subtitle_sw: swText(b.subtitle, s?.subtitle),
      location_en: b.location, location_sw: swText(b.location, s?.location),
      start_time: b.start_time, max_participants: b.max_participants,
      registration_start_date: timestamp(b.registration_start_date),
      registration_end_date: timestamp(b.registration_end_date),
      event_date: timestamp(b.event_date), is_active: active,
      created_at: timestamp(b.created_at), updated_at: timestamp(b.updated_at),
    });
    const swPackages = s ? packagesOf(s) : [];
    packagesOf(b).forEach((p, index) => {
      const sp = swPackages.find((x) => x.category === p.category);
      const featuresEn = (p.features ?? []).map(String);
      const featuresSw = (sp?.features ?? []).map(String);
      bannerPackages.push({
        banner_id: b.id, event_id: Number(p.event_id), category: p.category,
        features_en: featuresEn,
        features_sw: featuresSw.length && featuresSw.join("|") !== featuresEn.join("|") ? featuresSw : [],
        sort_order: index,
      });
    });
  }
  note(`Banners: ${banners.length} (${bannerPackages.length} packages); Swahili banners in the dump: ${swBanners.length}.`);
  note();
}

// ---------------------------------------------------------------------------
// registrations
// ---------------------------------------------------------------------------

note("## Registrations");
note();
const registrations = [];
const problems = [];
{
  const idOf = (table, locale, oldId) => {
    if (oldId === null || oldId === undefined) return null;
    if (locale === "en") return oldId;
    const mapped = maps[table].get(oldId);
    if (mapped === undefined) problems.push(`SW registration refers to missing ${table} id ${oldId}`);
    return mapped ?? null;
  };
  const enIds = new Set((en.registrations ?? []).map((r) => r.registration_id).filter(Boolean));
  let renamed = 0;

  for (const [locale, db] of [["en", en], ["sw", sw]]) {
    for (const r of db.registrations ?? []) {
      let regId = r.registration_id || `MWF-${locale.toUpperCase()}-${r.id}`;
      if (locale === "sw" && enIds.has(regId)) {
        regId = `${regId}-SW`;
        renamed++;
      }
      registrations.push({
        registration_id: regId,
        locale,
        first_name: r.first_name, last_name: r.last_name, email: r.email, phone_number: r.phone_number,
        event_id: idOf("events", locale, r.event_id),
        shirt_size_id: idOf("shirt_sizes", locale, r.shirt_size_id),
        kids_shirt_size_id: idOf("shirt_sizes", locale, r.kids_shirt_size_id),
        collection_venue_id: idOf("collection_venues", locale, r.collection_venue_id),
        country_id: idOf("countries", locale, r.country_id),
        nationality_id: idOf("countries", locale, r.nationality_id),
        gender_id: idOf("genders", locale, r.gender_id),
        id_number: r.id_number, passport_number: r.passport_number,
        date_of_birth: r.date_of_birth,
        emergency_contact_name: r.emergency_contact_name, emergency_contact_number: r.emergency_contact_number,
        postal_code: r.postal_code, voucher_code: r.voucher_code,
        payment_status: r.payment_status ?? "pending",
        payment_confirmed_at: timestamp(r.payment_confirmed_at),
        payment_confirmed_by_name: r.payment_confirmation_by ?? null,
        payment_notes: r.payment_notes ?? null,
        created_at: timestamp(r.created_at), updated_at: timestamp(r.updated_at), deleted_at: timestamp(r.deleted_at),
      });
    }
  }
  registrations.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

  const count = (locale) => registrations.filter((r) => r.locale === locale).length;
  note(`English ${count("en")}, Swahili ${count("sw")} → ${registrations.length} registrations ` +
    `(${registrations.filter((r) => r.payment_status === "confirmed").length} paid, ` +
    `${registrations.filter((r) => r.deleted_at).length} previously deleted, kept as deleted).`);
  if (renamed) {
    note();
    note(`**${renamed} Swahili registration numbers were already used by English registrations** ` +
      `(both old systems counted from 1). Those Swahili ones got "-SW" added, e.g. MWF-2025-00012-SW.`);
  }

  const seen = new Map();
  const duplicates = [];
  for (const r of registrations) {
    if (r.deleted_at) continue;
    const key = `${String(r.email).toLowerCase()}|${r.event_id}`;
    if (seen.has(key) && seen.get(key).locale !== r.locale) duplicates.push([seen.get(key), r]);
    else seen.set(key, r);
  }
  if (duplicates.length) {
    note();
    note(`Possible duplicates — same email and race on both sites (nothing was deleted):`);
    for (const [a, b] of duplicates) note(`- ${a.registration_id} (EN) and ${b.registration_id} (SW): ${a.first_name} ${a.last_name}`);
  }
  note();
}

if (problems.length) {
  console.error("Cannot import — references that don't match:\n" + [...new Set(problems)].join("\n"));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// staff accounts (not imported: passwords can't move to Supabase Auth)
// ---------------------------------------------------------------------------

note("## Staff accounts to re-create");
note();
note("Passwords from Laravel can't be moved. Create these people again in the dashboard (Users → add):");
const staff = new Map();
for (const [locale, db] of [["en", en], ["sw", sw]]) {
  for (const u of db.users ?? []) {
    const key = String(u.email).toLowerCase();
    const entry = staff.get(key) ?? { ...u, sites: [] };
    entry.sites.push(locale.toUpperCase());
    staff.set(key, entry);
  }
}
for (const u of staff.values()) note(`- ${u.name} <${u.email}> — ${u.role ?? "user"} (${u.sites.join(" + ")} site)`);
note();

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------

sql.unshift(
  "\\set ON_ERROR_STOP on",
  "begin;",
  "truncate public.banner_packages, public.marathon_banners, public.event_features, public.event_types,",
  "  public.schedule_events, public.schedule_days, public.registrations, public.events, public.shirt_sizes,",
  "  public.collection_venues, public.countries, public.genders restart identity;",
);

const lookupCols = {
  events: ["id", "name_en", "name_sw", "description_en", "description_sw", "local_price", "foreign_price", "local_kids_price", "distance_km", "is_kids_event", "is_active", "sort_order", "created_at", "updated_at"],
  shirt_sizes: ["id", "name_en", "name_sw", "code", "is_kids_size", "is_active", "sort_order", "created_at", "updated_at"],
  collection_venues: ["id", "name_en", "name_sw", "address", "description_en", "description_sw", "is_active", "sort_order", "created_at", "updated_at"],
  countries: ["id", "name_en", "name_sw", "code", "nationality_en", "nationality_sw", "is_active", "sort_order", "created_at", "updated_at"],
  genders: ["id", "name_en", "name_sw", "code", "is_active", "sort_order", "created_at", "updated_at"],
};
const withDefaults = (list) => list.map((r) => ({ ...r, created_at: r.created_at ?? new Date().toISOString(), updated_at: r.updated_at ?? new Date().toISOString() }));
insert("events", lookupCols.events, withDefaults(events), { explicitId: true });
insert("shirt_sizes", lookupCols.shirt_sizes, withDefaults(shirtSizes), { explicitId: true });
insert("collection_venues", lookupCols.collection_venues, withDefaults(venues), { explicitId: true });
insert("countries", lookupCols.countries, withDefaults(countries), { explicitId: true });
insert("genders", lookupCols.genders, withDefaults(genders), { explicitId: true });
insert("event_types", Object.keys(eventTypes[0] ?? { id: 0 }), withDefaults(eventTypes), { explicitId: true });
if (eventFeatures.length) insert("event_features", Object.keys(eventFeatures[0]), withDefaults(eventFeatures));
insert("schedule_days", Object.keys(scheduleDays[0] ?? { id: 0 }), withDefaults(scheduleDays), { explicitId: true });
if (scheduleEvents.length) insert("schedule_events", Object.keys(scheduleEvents[0]), withDefaults(scheduleEvents));
insert("marathon_banners", Object.keys(banners[0] ?? { id: 0 }), withDefaults(banners), { explicitId: true });
if (bannerPackages.length) insert("banner_packages", Object.keys(bannerPackages[0]), bannerPackages);
if (registrations.length) insert("registrations", Object.keys(registrations[0]), withDefaults(registrations));

for (const table of ["events", "shirt_sizes", "collection_venues", "countries", "genders", "event_types", "event_features",
  "schedule_days", "schedule_events", "marathon_banners", "banner_packages", "registrations"]) {
  sql.push(`select setval(pg_get_serial_sequence('public.${table}', 'id'), greatest((select max(id) from public.${table}), 1));`);
}
// New registration numbers continue after the highest imported one.
sql.push(`select setval('public.registration_number_seq', greatest(n, 1), n > 0) from (select coalesce(
  max(substring(registration_id from '^MWF-\\d{4}-(\\d+)$')::int), 0) as n from public.registrations) last;`);

// Fail the whole transaction if anything is missing.
sql.push("do $$ begin");
for (const [table, count] of Object.entries(expected)) {
  sql.push(`  if (select count(*) from public.${table}) <> ${count} then raise exception 'row count mismatch in ${table}: expected ${count}'; end if;`);
}
sql.push("end $$;");
sql.push(
  "select 'events' as table_name, count(*) from public.events union all select 'registrations', count(*) from public.registrations " +
    "union all select 'event_types', count(*) from public.event_types union all select 'schedule_days', count(*) from public.schedule_days " +
    "union all select 'marathon_banners', count(*) from public.marathon_banners union all select 'countries', count(*) from public.countries;",
);
sql.push(COMMIT ? "commit;" : "rollback;");

fs.writeFileSync(path.join(DIR, "import.sql"), sql.join("\n") + "\n");

note("## Row counts written");
note();
for (const [table, count] of Object.entries(expected)) note(`- ${table}: ${count}`);
fs.writeFileSync(path.join(DIR, "REPORT.md"), report.join("\n") + "\n");

console.log(`Wrote data-import/import.sql and data-import/REPORT.md — running ${COMMIT ? "for real" : "as a dry run"}…`);
const result = spawnSync("psql", [process.env.DATABASE_URL, "-q", "-f", path.join(DIR, "import.sql")], { encoding: "utf8" });
process.stdout.write(result.stdout);
if (result.status !== 0 || /ERROR/.test(result.stderr)) {
  process.stderr.write(result.stderr);
  console.error("Import FAILED — nothing was changed.");
  process.exit(1);
}
console.log(COMMIT ? "Import committed." : "Dry run OK — nothing was changed. Run again with --commit to import.");
