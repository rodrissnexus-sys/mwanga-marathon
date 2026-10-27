# Phase 4 — Importing the old MySQL databases

## 1. Export both databases
For **each** old site (English `api.mwafem.com`, Swahili `api-sw.mwafem.com`):
1. Hosting control panel → **phpMyAdmin** → select the database
   (its name is `DB_DATABASE` in that server's `.env`).
2. **Export** → method **Quick** → format **SQL** → **Go**.
3. Save as `data-import/en.sql` (English) or `data-import/sw.sql` (Swahili) in this project.

`data-import/` is ignored by git — it contains participants' personal data.
Delete the files when the migration is finished.

## 2. Dry run (changes nothing)
```bash
npm run db:import
```
Writes `data-import/REPORT.md` and `data-import/import.sql`, then runs the
import inside a transaction and **rolls it back**. Read the report.

## 3. Import for real
```bash
npm run db:import -- --commit
```
Replaces race categories, dropdowns, home-page content, banners and
registrations in Supabase with the merged data (staff accounts and contact
messages are kept). Run it again right before switching the domains so the
latest registrations come across — registrations made on the *new* site
before then are test data and are replaced.

## What the import does
| Data | How English and Swahili are combined |
|---|---|
| Race categories, shirt sizes, venues, countries, genders | English ids are kept. Swahili rows are matched by code (sizes, countries, genders) or by id + prices/address (races, venues); their text becomes the Swahili version. Rows only in the Swahili database are added and listed for review. |
| Race distance / kids flag | derived from the English race names — listed in the report to check |
| Event program, schedule | English is the base; Swahili matched by slug / day identifier, child items by position (mismatches listed) |
| Banners | English is the base; Swahili titles and package features matched by event date and package category |
| Registrations | all from both sites, `locale` = en / sw, references remapped. Both old systems numbered from 1, so a Swahili number already used in English gets `-SW` (e.g. `MWF-2025-00012-SW`). Deleted registrations stay deleted. Same email + race on both sites is listed as a possible duplicate, never removed. New registrations continue after the highest imported number. |
| Staff users | not imported (Laravel passwords can't move to Supabase Auth); listed in the report to re-create in the dashboard |

Every table's row count is checked inside the transaction; any mismatch or
unknown reference aborts the whole import.

Tested with synthetic dumps covering both export formats, MySQL escapes,
unicode, different country ids between the two databases, a Swahili-only
country, number collisions, duplicates, soft-deleted rows and banner
packages in both storage formats.
