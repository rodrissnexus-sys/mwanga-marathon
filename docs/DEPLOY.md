# Going live on Vercel

Three stages. Each one is safe to stop after: the old sites keep running
until stage 3.

1. **Preview** — the new site on a free `*.vercel.app` address (today).
2. **Data** — import the old registrations and content (Phase 4).
3. **Switch** — point `mwafem.com` and `sw.mwafem.com` to Vercel, turn on emails,
   change every password and key that was shared in chat.

---

## Stage 1 — Preview (about 10 minutes)

### 1. Import the project
1. Go to **vercel.com** → **Sign up / Log in with GitHub** (account `rodrissnexus-sys`).
2. **Add New… → Project** → find **mwanga-marathon** → **Import**.
   (If it isn't listed: *Adjust GitHub App Permissions* → allow the repository.)
3. Framework is detected as **Next.js**. Leave build settings as they are.

### 2. Environment variables
Before clicking Deploy, open **Environment Variables** and add these
(copy the values from your `.env.local` file). Leave all three environments ticked.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from `.env.local` (the `sb_publishable_…` key) |
| `SUPABASE_SERVICE_ROLE_KEY` | from `.env.local` (the `sb_secret_…` key) — **mark as Sensitive** |
| `ADMIN_EMAIL` | `info@mwafem.com` (where registration and contact notices go) |

Do **not** add `DATABASE_URL` — the website doesn't need it.

### 3. Deploy
Click **Deploy** (2–3 minutes). You get an address like
`mwanga-marathon.vercel.app`. Check:
- `/` and `/sw` — both languages load, the registration form shows events.
- `/login` → log in with your admin account → `/dashboard`.
- Register a test runner, then find and delete it in the dashboard
  (or in Supabase → Table Editor → `registrations`).

Every `git push` to `main` now redeploys automatically.

### 4. Supabase setting (once)
Supabase → **Authentication → Sign In / Providers** → turn **off**
"Allow new users to sign up". Staff accounts are created from the dashboard.

---

## Stage 2 — Data (Phase 4)
Export both MySQL databases (phpMyAdmin → Export → Quick → SQL) as
`data-import/en.sql` and `data-import/sw.sql`, then run the import (see
`docs/PHASE4.md`). Re-run it right before stage 3 so the newest
registrations come across.

---

## Stage 3 — Switch the domains

### 1. Add the domains in Vercel
Project → **Settings → Domains** → add:
- `mwafem.com`
- `www.mwafem.com` (redirects to `mwafem.com` — set up in `vercel.json`)
- `sw.mwafem.com` (redirects to `mwafem.com/sw/…` — set up in `vercel.json`)

Vercel then shows the DNS records to create.

### 2. DNS at Namecheap
Namecheap → **Domain List → mwafem.com → Manage → Advanced DNS**.
Replace the current records for `@`, `www` and `sw` with what Vercel shows —
normally:

| Type | Host | Value |
|---|---|---|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com.` |
| CNAME | `sw` | `cname.vercel-dns.com.` |

Keep the `api` and `api-sw` records for now (rollback), and **don't touch MX
records** (your email).

DNS takes from a few minutes to a few hours. Vercel issues HTTPS certificates
automatically.

### 3. Site address
Vercel → Settings → Environment Variables → add
`NEXT_PUBLIC_SITE_URL` = `https://mwafem.com` (Production) → **Redeploy**.
(Used for the sitemap and links shared on social media.)

### 4. Emails (Resend)
1. **resend.com** → sign up → **Domains → Add Domain** → `mwafem.com`.
2. Add the DNS records Resend shows (in Namecheap Advanced DNS). Wait for "Verified".
3. **API Keys → Create** (permission: Sending access).
4. Vercel → Environment Variables:
   - `RESEND_API_KEY` = the key — **Sensitive**
   - `EMAIL_FROM` = `Mwanga Festival & Marathon <info@mwafem.com>`
5. Redeploy, register a test runner with your own email, check the inbox.

### 5. Change every credential shared in chat
| What | Where |
|---|---|
| The GitHub token shared in chat | GitHub → Settings → Developer settings → Personal access tokens → delete |
| Supabase database password | Supabase → Project Settings → Database → Reset password → update `DATABASE_URL` in `.env.local` |
| Supabase secret key | Supabase → Project Settings → API Keys → create a new secret key, delete the old one → update `.env.local` **and** Vercel `SUPABASE_SERVICE_ROLE_KEY` → redeploy |
| Your admin password | log in → change it (or Supabase → Authentication → Users → send password recovery) |

### 6. Old servers
Keep `api.mwafem.com` / `api-sw.mwafem.com` running for about two weeks in
case you need to roll back, then cancel the hosting. **Rollback:** put the old
DNS records for `@`, `www` and `sw` back in Namecheap.
