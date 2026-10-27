# Phase 5 — Supabase replaces the Laravel APIs

The site no longer calls `api.mwafem.com` / `api-sw.mwafem.com`. Everything
reads and writes the Supabase project directly.

## How data flows
| What | How |
|---|---|
| Public content (events, sizes, venues, countries, genders, event program, schedule, active banner) | browser → Supabase with the publishable key; RLS only returns active rows |
| Registration form | server action `src/server/registrations.ts` → Zod validation → rate limit (3 per IP per 5 min) → insert with secret key → emails in the background |
| Sponsors contact / partnership forms | server action `src/server/messages.ts` → saved in `contact_messages` (5 per IP per 10 min) → email to `ADMIN_EMAIL` |
| Dashboard reads and content edits | browser → Supabase **as the logged-in staff member**; RLS checks the role on every request |
| Confirm payment | server action (admins + moderators), records who confirmed, emails the participant |
| Staff accounts (list, create, edit, suspend, delete) | server actions `src/server/users.ts`, admin only, Supabase Auth admin API |
| Login | Supabase Auth (email + password), session in cookies; `src/proxy.ts` refreshes it and sends visitors from `/dashboard` to `/login` |

The ported components still call the same functions in `src/api/*`; only
their insides changed, so return shapes match what the screens expect.
`src/lib/content.js` turns `name_en`/`name_sw` columns into `name` for the
language being viewed (Swahili falls back to English).

## Dashboard content language
`/dashboard` edits **English** text, `/sw/dashboard` edits **Swahili** text — the
same workflow as the two old dashboards. A bar at the top says which one is
being edited and links to the other. Shared values (prices, dates, icons,
active flags) are the same for both languages. A new item created on the
Swahili dashboard also fills the English text, so the English site is never blank.

## Fixed along the way
- Registrations, payments: real **search**, **filters** (race, payment status, site language),
  **paging** (25 per page, server side) and **CSV export**; the Filter/Export buttons
  and search boxes did nothing before.
- Removed the fake "mock" rows that were shown (and could be "confirmed") when loading failed.
- Contact and partnership forms now actually send.
- Staff can be **suspended / re-activated** (the status buttons never worked before).
- Kids shirt sizes follow the event's `is_kids_event` flag; race cards show the stored
  `distance_km` (previously guessed from English names — "Cycling race (42km)" showed 42.195 km).
- Adult shirt-size list no longer includes kids sizes.
- Dashboard statistics count registrations per race category (they compared against
  home-page "event types" before, so always showed 0) and use gender codes.
- Banner details screen shows packages for package-based banners again.
- Registration emails show the local price for Tanzanians (the old check never matched).
- Payment-confirmed email exists (its template was missing).
- A form logged the login token to the browser console — removed.
- Laravel client (`ky`), token storage in `localStorage` and per-language API switching removed.

## Emails (Resend — configured at the end)
`src/server/email.ts` sends through Resend's API when `RESEND_API_KEY` and
`EMAIL_FROM` are set; until then emails are skipped (logged) and forms still work.
Templates (EN/SW): welcome to participant, new-registration notice to `ADMIN_EMAIL`,
payment confirmed, contact/partnership notice. `src/server/email-templates.ts`.

## Tests
| Command | What |
|---|---|
| `npm test` | Vitest: form validation rules, language helpers (16 tests) |
| `npm run build && npm run test:e2e` | Playwright against the real project: register (EN + SW), login redirects, wrong password, moderator confirms a payment, moderator blocked from user management, admin sees staff, contact form, public key can't read/write private data (9 tests). Creates and deletes its own `e2e-*` accounts and rows. Set `CHROMIUM_PATH` to use a system Chromium. |
| `npm run db:check-rls` | 22 database permission checks |

## Still to do
- Phase 4: import the two MySQL databases (needs the `en.sql` / `sw.sql` exports).
- Phase 6: Vercel deploy, domains, Resend, rotating the credentials shared in chat.
- Dashboard UI text is English only (content can be edited in both languages).
- Contact messages are stored but there is no dashboard screen for them yet
  (read them in Supabase → Table Editor → `contact_messages` for now).
