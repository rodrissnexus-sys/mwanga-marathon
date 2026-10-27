# MWAFEM migration — Phase 1 audit

Sources (read-only):
- EN: `/home/iamrodriss/Desktop/mwafem-main` — site `mwafem.com`, API `api.mwafem.com`
- SW: `/home/iamrodriss/Desktop/mwafem_sw-main` — site `sw.mwafem.com`, API `api-sw.mwafem.com`

Audited 2026-10-27.

---

## 1. Critical findings (live production today)

| # | Severity | Where | Problem |
|---|---|---|---|
| C1 | **Critical** | SW `api/routes/api.php` lines 162–180 | `POST/PUT/DELETE /api/event-data/event-types` and `/api/event-data/schedule` have their `auth:sanctum` group **commented out**. Anyone on the internet can create, edit or delete event types and the schedule shown on `sw.mwafem.com`. |
| C2 | **Critical** | EN + SW `GET /api/marathon/registrations` | No auth. Returns every registration with name, email, phone, date of birth, ID/passport number, emergency contact. The EN dashboard (`src/api/marathon/dashboard.js`) relies on this public route. |
| C3 | High | EN + SW `database/seeders/AdminUserSeeder.php` | Admin password for `info@mwafem.com` is hard-coded in the repo. If that account still uses it, it must be changed. |
| C4 | High | EN + SW dropdown routes (`events`, `shirt-sizes`, `collection-venues`, `countries`, `genders`) | Writes require login only, not the admin role — any moderator (or any `user`-role account) can edit them. |
| C5 | Medium | `MarathonBannerController::getActiveBanner` | Returns a `debug` block with server time and dates when closed. Harmless but noisy. |
| C6 | Medium | `RegistrationController` | Errors return `$e->getMessage()` to the public (can leak SQL/internal details). |

C1–C3 exist on the live servers **now** and are independent of the migration.

---

## 2. Functional bugs found (carry-over decisions)

| # | Where | Bug | Plan in new app |
|---|---|---|---|
| B1 | `RegistrationController::register` | `is_local = nationality->name === 'Tanzanian'`, but the nationality relation is a `Country` whose `name` is `Tanzania` (`nationality` column holds `Tanzanian`). So `is_local` is always false → emails always show the foreign price. | Fix: compare country `code === 'TZA'`. |
| B2 | `RegistrationController::confirmPayment` | Renders `registration_templates.member.payment_confirmed`, which **does not exist** in either project. The payment-confirmation email always fails silently. | Build the template. |
| B3 | Both email templates (EN + SW) | The SW API sends the **English** templates (files are identical). | Send emails in the registrant's locale. |
| B4 | `GeneralContactForm.jsx`, `PartnershipForm.jsx` (Sponsors page) | Submissions are **simulated** (`setTimeout`) — nothing is sent anywhere. | Needs a decision (see §9). |
| B5 | Sidebar | Links to `/dashboard/settings`, which has no route (redirects to `/dashboard`). | Drop the link or build settings — decision. |
| B6 | `AuthController::register` | Always creates role `user`; role then needs a second update call. Role `user` has no meaning anywhere else. | Create with chosen role (admin/moderator) in one step. |
| B7 | `MarathonBannerPolicy` (SW only) | Defined but **never registered** — dead code. Its rules (moderator may view banners, only admin may change) are reasonable. | Adopt those rules. |
| B8 | `registration_id` | `MWF-{year}-{id padded 5}` generated after insert using the auto-increment id. Two DBs → the same `MWF-2025-00012` can exist in EN and SW. | On merge, detect collisions and report; new IDs from a single sequence. |

---

## 3. Backend (Laravel 10 + MySQL + Sanctum + PHPMailer)

### 3.1 Tables

| Table | Columns (besides id, timestamps) | Translatable text |
|---|---|---|
| `users` | name, email (unique), password, role (`user`/`moderator`/`admin`, default `user`), email_verified_at, remember_token | — |
| `events` (race categories) | name, description, local_price (TZS), foreign_price (USD), local_kids_price (TZS), is_active, sort_order | name, description |
| `shirt_sizes` | name, code (unique), is_kids_size, is_active, sort_order | name |
| `collection_venues` | name, address, description, is_active, sort_order | name, description (address likely same) |
| `countries` | name, code (ISO-3, unique), nationality, is_active, sort_order | name, nationality |
| `genders` | name, code (unique), is_active, sort_order | name |
| `registrations` | registration_id (unique, nullable), first_name, last_name, email, phone_number, event_id, shirt_size_id, kids_shirt_size_id?, collection_venue_id, country_id, gender_id, nationality_id (→countries), id_number?, passport_number?, date_of_birth, emergency_contact_name, emergency_contact_number, postal_code?, voucher_code?, payment_status (`pending`/`confirmed`/`failed`), payment_confirmed_at?, payment_confirmation_by? (name string), payment_notes?, **deleted_at (soft delete)** | — (add `locale`) |
| `event_types` | event_id (string slug, unique), title, subtitle, icon, color, description, highlight?, image?, sort_order, is_active | title, subtitle, description, highlight |
| `event_features` | event_type_id (cascade), text, icon, sort_order, is_active | text |
| `schedule_days` | day, date (string), day_identifier?, sort_order, is_active | day, date (free text) |
| `schedule_events` | schedule_day_id (cascade), time, title, location, description, icon, sort_order, is_active | title, location, description (time probably same) |
| `marathon_banners` | title, subtitle?, location, start_time (string), max_participants, registration_start_date, registration_end_date, event_date, is_active (only one active at a time), full/half/fun_run `_event_id` (→events, set null) + `_features` JSON, **event_packages JSON** (EN only) `[{category, event_id, features[]}]` | title, subtitle, location, package features |
| Laravel internals | password_reset_tokens, failed_jobs, personal_access_tokens | not migrated |

Seed data: 4 genders, ~adult+kids shirt sizes, events (Cycling 42km, Race 21km, Trail 10km, 10K Run, …), 4 collection venues, full country list (Tanzania first), admin user.

### 3.2 Endpoints (EN — baseline)

Auth: `CheckRole` → `admin` requires admin; `moderator` accepts admin or moderator.
Response envelopes differ per controller (`{success,data}`, `{status,data}`, raw).

| Method & path | Auth (today) | Notes |
|---|---|---|
| POST `/login` | public | revokes all old tokens, returns `{access_token, user}` |
| GET `/user`, POST `/logout` | token | |
| POST `/register` (create staff user), GET `/users`, PUT `/users/{id}`, DELETE `/users/{id}` | admin | admins can't be deleted; password `confirmed` + `Password::defaults()` |
| POST/PUT/DELETE `/admin/event-types`, `/admin/schedule-days` | admin | duplicates of the event-data write routes |
| GET `/registrations/confirmed-payments`, POST `/registrations/{id}/confirm-payment` | admin (outer group wins over the inner `admin,moderator`) | confirm sets status, timestamp, confirmer name, notes; sends email (B2) |
| GET/POST/PUT/DELETE `/admin/marathon-banners`, GET `.../events`, GET `.../{id}`, PATCH `.../{id}/toggle` | admin | activating one deactivates all others; legacy fields auto-converted to `event_packages`; responses "enriched" with full event objects |
| POST `/marathon/register` | public, rate-limited | **3 submissions / 5 min / IP**; validation below; sends member + admin emails |
| GET `/marathon/registrations` | **public (C2)** | all registrations + relations |
| GET `/marathon-banner/active` | public | `{status:'closed'}` unless an active banner is inside its registration window |
| GET `/dropdowns/{events,shirt-sizes,collection-venues,countries,genders}` (+ `/{id}`) | public | active only, by sort_order; shirt sizes filter `?is_kids_size=` |
| POST/PUT/DELETE same | token only (C4) | |
| GET `/event-data/event-types` (+ `/{id}`) | public | with features |
| GET `/event-data/schedule` (+ `/{id}`) | public | with active events |
| POST/PUT/DELETE event-data | token (EN) / **none (SW, C1)** | nested features/events synced (create/update/delete missing) |
| POST `/registrations` | public, **not rate-limited** | duplicate of `/marathon/register` |
| GET `/registrations` (+ `/{id}`) | `role:admin,moderator` but **no `auth:sanctum`** → returns 401 before login is resolved | effectively broken/unused |

Registration validation: first/last name ≤255, email, phone ≤20, event/shirt size/venue/nationality/country/gender must exist, kids shirt size optional, id_number/passport ≤50 optional, date_of_birth date, emergency name ≤255 + number ≤20, postal_code ≤20, voucher ≤50.

Emails (PHPMailer SMTP, env `MAIL_*`, `ADMIN_EMAIL` default `info@mwafem.com`, 3 retries):
1. Member welcome — `registration_templates/member/member.blade.php` (156 lines)
2. Admin notification — `registration_templates/admin/admin.blade.php` (141 lines), reply-to set to registrant
3. Payment confirmed — template missing (B2)

> Correction to earlier planning notes: the backend **does send emails**. The new app needs an email sender (see §9).

### 3.3 EN ↔ SW backend divergences

| Item | EN | SW |
|---|---|---|
| `event_packages` column + legacy→packages conversion | yes | no |
| Banner subtitle max | 1000 | 255 |
| Banner toggle route | `PATCH .../{id}/toggle` | `PATCH .../{id}/toggle-active` |
| Banner admin routes | admin only | admin only (moved earlier in file) |
| Public banner/closed messages | English | Swahili |
| event-data writes | token required | **public (C1)** |
| `MarathonBannerPolicy` | — | present, unregistered (B7) |

---

## 4. Frontend (React 19 + Vite + Tailwind v4 + react-router 7)

~16.4k lines, 94 files per project.

### 4.1 Routes

| Path | Page | Layout |
|---|---|---|
| `/` | `pages/home/MwafemLanding` — Hero, Banner (active marathon banner, 767 lines), About, EventType, Schedule, Highlight, Registration (multi-step form: PersonalInfo, EventDetails, EmergencyContact, AdditionalInfo) | Main |
| `/about` | About — FestivalDescription, MissionVision, EventFacts, Team, Sponsors, RegistrationCTA | Main |
| `/sponsors` | Sponsors — SponsorshipTiers (+ PartnershipForm modal), ContactSection (+ GeneralContactForm modal) | Main |
| `/events` | Events — EventOverview, EventGallery (616 lines) | Main |
| `/race-categories` | RaceCategories — CategoryCards (API events), CategoryFAQ, CategoryCTA | Main |
| `/register` | Register — PaymentInformation | Main |
| `*` | NotFound | Main |
| `/login` | auth/Login | none |
| `/dashboard/*` | Dashboard: Home (metrics + charts), registration, payments, users, events (event types + schedule days), user-management (admin), marathon-banners/* (admin) | DashboardLayout (Sidebar, TopBar, ThemeContext dark/light) |

Main layout: Header (484 lines), Footer, BackToTop, SpeedInsights; framer-motion `PageTransition` with `AnimatePresence`; `ScrollToTop`; lazy pages with `Preloader` fallback.

### 4.2 Shared pieces
`components/common`: HeroSection (used by 6 pages, data from `pages/*/data/*HeroData.js`), SectionHeader, PrimaryButton, Modal, BackToTop, ScrollToTop, PageTransition, NotFound. `contexts/AuthContext` (token in `localStorage`), `components/auth/ProtectedRoute` (role check). Hooks: `useDropdowns`, `useMarathonRegistration`. API layer: `src/api/*` on `ky` with `localStorage` bearer token.

### 4.3 Libraries actually used
| Package | Files | Keep? |
|---|---|---|
| framer-motion | 22 | yes (client components) |
| @fortawesome/* | 29 | yes |
| lucide-react | 7 | yes |
| chart.js + react-chartjs-2 | 1 | yes (dashboard, client-only) |
| react-helmet-async | 7 | replace with Metadata API |
| ky | 1+ (api layer) | remove after Phase 5 |
| react-router-dom | 23 | replace |
| **react-slick, slick-carousel, @headlessui/react, @heroicons/react, react-icons, @react-google-maps/api** | **0** | drop — unused |

No Google Maps usage and no API keys in the frontend → no `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` needed.

### 4.4 Browser-only code (needs `"use client"`)
`localStorage`: `api/auth.js`, `api/client.js`, `api/users.js`, `api/eventData.js`, `contexts/AuthContext.jsx`, `dashboard/contexts/ThemeContext.jsx`.
`window`/`document`: Header (scroll, language switcher), BackToTop, ScrollToTop, Modal, home HeroSection, AdditionalInfo, EventGallery, dashboard TopBar/Sidebar/DashboardLayout/ScheduleDayForm, MwafemLanding.
Plus every framer-motion and chart component.

### 4.5 Styling
Tailwind v4 via `@tailwindcss/vite`; `src/index.css` defines a `@theme` that **resets all default colors** (`--color-*: initial`) and sets primary `#221751`, secondary `#bffc00`, tertiary `#fff`, success `#14b31e`, black, red, text-primary. Custom 1390px breakpoint helper classes, `raceAcross` and `slideDown` keyframes (SW lacks `slideDown`). No web fonts loaded (system font stack). `scroll-padding-top: 120px`.

### 4.6 EN ↔ SW frontend divergences (beyond translated text)

| Item | Difference |
|---|---|
| Header | SW has a language dropdown (EN/SW) that redirects between domains preserving path. EN has none. |
| Dashboard | SW translates sidebar labels and some form/list labels → dashboard should be bilingual too. |
| `api/client.js` | EN: 10 s default timeout, banner client extends main. SW: no default timeout, separate banner client. |
| `api/auth.js` | SW uses a `requiresAuth` flag instead of explicit headers (equivalent). |
| `api/marathon/registration.js` | EN reads `error.response.data.errors`; SW reads `error.errors`. |
| `api/marathon/banner.js` | SW defines its own endpoints (with `toggle-active`); stray `banner.js.new` file. |
| Banner UI (`Banner.jsx`, `BannerForm`, `PackageEditor`, `BannerList`, `BannerDetails`) | EN supports dynamic `event_packages`; SW uses legacy fixed fun-run/half/full fields. |
| `index.css` | EN has extra `slideDown` keyframes. |
| `index.html` | SW has description, author, Open Graph tags and a `<title>`; EN has none in HTML (relies on Helmet). |
| `public/` | SW has `robots.txt`, `sitemap.xml`; `wasafi_media_logo` is `.jpeg` (EN) vs `.png` (SW); `osaka_classic_logo.png` differs. |
| Docs | EN has 8 dev notes (`API_*.md`, `REFACTORING_*.md`, …); SW none. |

Baseline for the port: **EN code + SW strings + SW switcher/metadata/robots/sitemap**.

---

## 5. Database content that differs per language

Because there are two databases, these tables likely hold English text in EN and Swahili text in SW and must be merged into `_en`/`_sw` columns: `events`, `event_types`, `event_features`, `schedule_days`, `schedule_events`, `marathon_banners` (+ package features), probably `collection_venues`, `shirt_sizes`, `genders`, `countries`. **Unknown until the MySQL dumps are available** (Phase 4). Registrations live in both DBs and are merged with a `locale` column.

---

## 6. Things that don't need migrating
Laravel tokens/password resets/failed jobs, Blade `welcome` view, Laravel frontend assets (`api/resources/js|css`), PHPUnit example tests, the 8 EN markdown dev notes.

---

## 7. Assets
`public/assets/images`: 27 JPGs (desktop + `_mobile_view` variants) → serve via `next/image`. `public/assets/sponsors`: 21 logos. `public/assets/logo/logo.png`, `public/assets/favicon/*` + `site.webmanifest`.

---

## 8. Plan adjustments vs. MIGRATION_PROMPT.md
1. Add an **email sender** (member welcome, admin notification, payment confirmed) with EN/SW templates.
2. Drop Google Maps env var — not used.
3. Make the **dashboard bilingual** (SW already partly is).
4. Adopt SW policy rule: moderators may **view** banners; only admins change them. Payment confirmation: today admin-only in practice (route nesting), though the code intends admin+moderator — decision below.

---

## 9. Decisions needed before Phase 2/5

1. **Email provider:** (a) reuse the current SMTP mailbox via `nodemailer` (no new account; needs the `MAIL_*` values from the server `.env`), or (b) Resend (free tier 3k/month, better deliverability, needs DNS records). *Recommendation: (a) for launch.*
2. **Contact & partnership forms** (currently fake): make them email `info@mwafem.com`, or keep as-is?
3. **Moderators confirming payments:** allow (code's intent) or admin-only (current behaviour)?
4. **Live security fixes (C1–C3)** — fix on the current servers now (I can prepare the exact changes), or wait for the cut-over?
