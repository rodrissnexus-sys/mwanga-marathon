# Phase 2 — Next.js frontend (still on the Laravel APIs)

## What was built
- Next.js 16.4 (App Router, Turbopack, Cache Components) in `mwafem-next/`.
- English at `/…`, Swahili at `/sw/…` (`next-intl`, `src/i18n/`, `src/proxy.ts`).
  `/en/…` redirects to `/…`. Language switch keeps the current page.
- All public pages, login and dashboard ported from `mwafem-main` with the same
  markup and Tailwind classes; Swahili text from `mwafem_sw-main` merged into
  `messages/sw/*.json` (509 strings per language).
- Per-page `<title>`/description, Open Graph, `hreflang` alternates,
  `/sitemap.xml` (both languages) and `/robots.txt` (dashboard/login excluded).
- `next/image` for the hero backgrounds, home slideshow, event gallery and logo.
- Vercel Analytics + Speed Insights.
- Data still comes from the Laravel APIs: English pages → `api.mwafem.com`,
  Swahili pages → `api-sw.mwafem.com` (`src/api/config.js`). Separate login
  tokens per API.

## How it was verified
- `npm run build` ✓ (52 pages pre-rendered), `npm run lint` ✓ 0 errors (92 warnings, all in ported code).
- Old Vite apps (EN and SW) and the new app were run side by side and every
  page screenshotted at 375 px and 1440 px:
  - English: home, about, register, login, 404 → pixel-identical (0.0 % diff);
    events 0.1–0.3 % (slideshow timing).
  - Swahili: 1–8 % diff, from intended changes (EN styling baseline, newly
    translated text).
  - No JavaScript errors on any page.
- Live APIs were not reachable from this machine (DNS), so data sections showed
  their "unavailable" states in both old and new — data loading must be checked
  on a Vercel preview.

## Intentional changes vs. the old sites
| Change | Why |
|---|---|
| Sponsors page now shows the sponsor logos section in both languages | Only the Swahili site had it |
| Race Categories hero image fixed | English pointed to a missing file |
| Register hero button links to `#register` | `/register#register` would leave `/sw/` |
| Nationality options use stable ids (`tz_ea`, `tz_resident_sadc`, `international`) | Code compared against "International Participants" while the option was "International Runners" |
| Swahili-only style tweaks (a few class differences) unified to the English styling | One codebase |
| Better-quality Osaka Classic and Wasafi Media logos (from the Swahili copy) | Sharper |
| Unused `TeamSection` (placeholder "John Doe" staff) removed | Never rendered |
| Page transitions: enter animation kept, exit animation dropped | App Router has no exit hook |

## Known issues carried over (unchanged on purpose — decide or fix in Phase 5)
- Footer links `/contact` and `/faqs` lead to 404; newsletter box does nothing.
- Contact and partnership forms don't send anything (Phase 5: save to Supabase + email via Resend).
- "Forgot password? reset" link goes nowhere (Phase 5: Supabase password reset).
- Kisangara Tours link uses `kisangaratours.com` in one place and `.net` in another.
- Dashboard is English only; on `/sw/dashboard` the Swahili API lacks event
  packages, so banner packages only work on the English dashboard.
- Kids shirt sizes appear when the selected event's name equals
  `home.registration.kidsEventName` (per language) — replace with a database flag in Phase 5.
- Distance on race cards is guessed from English event names ("Full", "Half", "10K", "5K");
  Swahili names show "Itafahamishwa" — Phase 5: store distance per event.
