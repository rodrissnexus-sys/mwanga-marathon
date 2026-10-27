# MWAFEM — Mwanga Festival & Marathon

Bilingual (English / Swahili) website and admin dashboard. Next.js 16 + Supabase, hosted on Vercel.

## Run locally
```bash
cp .env.example .env.local   # fill in the Supabase values
npm install
npm run dev        # http://localhost:3000  (Swahili: /sw, dashboard: /dashboard)
npm run build && npm start
npm run lint
npm test                     # unit tests
npm run test:e2e             # browser tests against Supabase (after a build)
npm run db:check-rls         # database permission checks
npm run db:types             # regenerate src/lib/supabase/database.types.ts
```

## Structure
| Path | What |
|---|---|
| `src/app/[locale]/(site)/` | public pages (header/footer layout) |
| `src/app/[locale]/login`, `dashboard/` | staff area (client-rendered) |
| `src/views/`, `src/components/`, `src/layouts/` | page and UI components (ported from the Vite app) |
| `src/i18n/` | languages, routing, message loading |
| `src/proxy.ts` | language routing |
| `messages/en/*.json`, `messages/sw/*.json` | all interface text |
| `src/api/` | data functions used by the components (Supabase underneath) |
| `src/server/` | server actions: registration, payments, contact forms, staff accounts, emails |
| `src/lib/supabase/` | Supabase clients and generated database types |
| `supabase/` | database migrations and seed data |
| `tests/` | unit (Vitest) and end-to-end (Playwright) tests |
| `docs/` | audit, phase notes, translation review, live-server fixes |

## Editing text / translations
Every visible string is in `messages/<locale>/<section>.json`; both languages
use the same keys. Change the value, keep the key and any `{placeholders}` or
`<tags>`. To add a new section file, also add its name to `NAMESPACES` in
`src/i18n/messages.ts`.

`scripts/i18n-extract.py` is the helper used to move hard-coded strings into
the message files (see its docstring).
