# Phase 3 — Supabase database

Project: `dkqgqayegzxgrteocnpv` (region eu-west-1, Ireland), PostgreSQL 17.

## Files
| File | What |
|---|---|
| `supabase/migrations/20261027000001_initial_schema.sql` | all tables, types, triggers, Row Level Security |
| `supabase/migrations/20261027000002_profile_on_role_assignment.sql` | fix: create the staff profile when Supabase attaches the role |
| `supabase/seed.sql` | starter data from the Laravel seeders (100 countries, 7 events, 9 shirt sizes, 4 genders, 4 venues) |
| `src/lib/supabase/database.types.ts` | generated TypeScript types (`npm run db:types`) |
| `scripts/check-rls.mjs` | security test against the live project (`npm run db:check-rls`) |

Apply to a project: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f <migration>` for each
migration in order, then the seed. (Both are already applied to the project above.)

## Tables
| Table | Notes |
|---|---|
| `events` | race categories; `name_en/_sw`, prices, **new:** `distance_km`, `is_kids_event` |
| `shirt_sizes`, `collection_venues`, `countries`, `genders` | dropdowns, `*_en` + optional `*_sw` |
| `event_types` + `event_features` | home "Event Program" |
| `schedule_days` + `schedule_events` | home schedule |
| `marathon_banners` + `banner_packages` | home banner; one active banner at a time (enforced by a unique index); packages replace both the old fixed fun-run/half/full columns and the English API's JSON |
| `registrations` | both sites in one table, `locale` = en/sw; `registration_id` (`MWF-YYYY-NNNNN`) set by the database; soft delete `deleted_at`; `search_text` + trigram index for dashboard search; **new:** `nationality_category` |
| `contact_messages` | **new:** Sponsors page contact + partnership forms |
| `profiles` | staff (admin / moderator), linked to Supabase Auth users |
| `rate_limits` + `hit_rate_limit()` | form rate limiting, server-only |

Swahili columns are optional; the site shows English when one is empty.

## Security (Row Level Security on every table)
| Who | Can |
|---|---|
| Visitor | read active public content only; cannot read registrations, messages or staff; cannot write anything |
| Logged-in account without a staff role (e.g. public sign-up) | same as a visitor |
| Moderator | read everything; update registrations (confirm payments) and messages |
| Admin | everything, incl. content, users, deleting registrations |

Registrations and form messages are inserted by the Next.js server with the
secret key after validation and rate limiting, never from the browser.
Staff accounts get their role through Auth `app_metadata`, which only the
server can set; the database turns that into a `profiles` row.

Verified with `npm run db:check-rls` against the live project: 22/22 checks pass
(visitor, signed-up stranger, moderator, admin).
