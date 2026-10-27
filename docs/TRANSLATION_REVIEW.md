# Swahili text to review

All 509 interface strings live in `messages/en/*.json` and `messages/sw/*.json`
(same keys in both). Most Swahili text was copied from the old `sw.mwafem.com`
site. The strings below **did not exist in Swahili before** — the old Swahili
site showed them in English — and were translated during the migration.
Please have a native speaker check them.

| File (`messages/sw/…`) | Keys |
|---|---|
| `about.json` | `festival.*` (whole "Welcome to the Mwanga Festival" section), `facts.*`, `purpose.*` (Mission/Vision), `cta.*`, `page.*` |
| `sponsors.json` | everything (tiers, benefits, contact block) |
| `forms.json` | everything (contact form, partnership form) |
| `common.json` | everything (login page, 404 page, preloader, back-to-top, modal) |
| `hero.json` | `about.*`, `sponsors.*` |
| `meta.json` | `about`, `sponsors`, `register`, `login`, `dashboard`, `notFound` |
| `home.json` | `banner.loading`, `banner.startingAt`, `banner.limitedTo`, `banner.loadingDetails`, `banner.localPrice`, `banner.noPackageDetails`, `banner.registrationClosed`, `banner.openUntil`, `banner.currentlyClosed`, `banner.marathonEvent*`, `form.voucherCode`, `registration.errors.nationalityAgain`, `registration.errors.nationalityAndCountry`, `registration.errors.nationalityIncomplete` |
| `events.json` | `gallery.gridLayout`, `gallery.masonryLayout`, `gallery.inCategory`, `overview.location` |
| `raceCategories.json` | `cards.defaultDescription`, `cards.fullMarathon*`, `cards.halfMarathon*`, `cards.race10k*`, `cards.funRun5k*`, `cards.tryAgain` |
| `header.json` | `toggleMenu`, `logoAlt` |

To change a translation, edit the value in `messages/sw/<file>.json` (keep the
key and any `{placeholders}` / `<tags>` unchanged) and redeploy.
