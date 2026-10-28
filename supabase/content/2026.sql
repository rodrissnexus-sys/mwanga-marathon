-- Mwanga Marathon 2026 content, from the organisers' letters (Oct 2026):
-- 20 December 2026, C.D. Msuya Stadium, Mwanga; races 21.1 / 10 / 5 / 2.5 km;
-- Tsh 40,000 entry; runner package; Mwanga Utalii Festivals programme.
-- Agreed with the organiser: foreigners USD 30, children Tsh 20,000,
-- registration closes 10 December 2026.
-- Items marked TO CONFIRM are placeholders the organiser still has to give.
--
-- Needs migration 20261028000001 (schedule time_en/time_sw).
-- Run once:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 --single-transaction -f supabase/content/2026.sql

-- 2025 races stay in the database (old registrations point to them) but are hidden.
update public.events set is_active = false where is_active;

insert into public.events
  (name_en, name_sw, description_en, description_sw, local_price, foreign_price, local_kids_price, distance_km, is_kids_event, is_active, sort_order)
values
  ('Half Marathon (21.1km)', 'Nusu Marathon (km 21.1)',
   'Half marathon for experienced runners.',
   'Mbio za nusu marathon kwa wanariadha na washiriki wenye uzoefu.',
   40000, 30, 20000, 21.1, false, true, 1),
  ('Trail Run (10km)', 'Trail Run (km 10)',
   'Ten kilometres through Mwanga''s natural scenery.',
   'Mbio za kilomita kumi zinazopita katika mandhari nzuri ya asili ya Mwanga.',
   40000, 30, 20000, 10, false, true, 2),
  ('Fun Run (5km)', 'Fun Run (km 5)',
   'Five kilometres for all runners and club members.',
   'Mbio za kilomita tano kwa wakimbiaji wote na wanachama wa vilabu.',
   40000, 30, 20000, 5, false, true, 3),
  ('Walking Safari (2.5km)', 'Walking Safari (km 2.5)',
   'A 2.5 km walk or easy run for families and elders — for health and fun.',
   'Matembezi na mbio fupi za kilomita 2.5 kwa wazee na familia kwa ajili ya afya na furaha.',
   40000, 30, 20000, 2.5, false, true, 4),
  ('Kids Walking Safari (2.5km)', 'Walking Safari ya Watoto (km 2.5)',
   'The 2.5 km Walking Safari for children (under 10), with a kids'' T-shirt.',
   'Walking Safari ya kilomita 2.5 kwa watoto (chini ya miaka 10), pamoja na T-shirt ya watoto.',
   20000, 15, 20000, 2.5, true, true, 5);

-- Home page banner (replaces the photo hero while active and registration is open).
update public.marathon_banners set is_active = false where is_active;

with banner as (
  insert into public.marathon_banners
    (title_en, title_sw, subtitle_en, subtitle_sw, location_en, location_sw, start_time, max_participants,
     registration_start_date, registration_end_date, event_date, is_active)
  values
    ('Mwanga Marathon 2026', 'Mwanga Marathon 2026',
     'Mwanga Marathon & Mwanga Utalii Festivals — "Mwanga yetu, utalii wetu"',
     'Mwanga Marathon na Mwanga Utalii Festivals — "Mwanga yetu, utalii wetu"',
     'C.D. Msuya Stadium, Mwanga, Kilimanjaro', 'Uwanja wa C.D. Msuya, Mwanga, Kilimanjaro',
     '06:00 AM',                                  -- TO CONFIRM: race start time
     2000,                                        -- TO CONFIRM: participant limit
     '2026-10-28 00:00:00+03',
     '2026-12-10 23:59:59+03',
     '2026-12-20 06:00:00+03',
     false)  -- kept off: the home page shows the photo hero; switch on in the dashboard if wanted
  returning id
),
package as (
  select
    array['Official Mwanga Marathon 2026 T-shirt', 'Drawstring bag', 'Festival wristband', 'Bib number',
          'Finisher medal', 'Water stations & fresh fruit', 'Music, dance & cultural shows', 'Official event photos'] as en,
    array['T-shirt rasmi ya Mwanga Marathon 2026', 'Mfuko wa mgongoni (drawstring bag)', 'Kikuku rasmi cha tamasha',
          'Namba rasmi ya mkimbiaji', 'Medali ya kumaliza mbio', 'Vituo vya maji na matunda safi',
          'Muziki, ngoma na maonesho ya sanaa', 'Picha rasmi za ukumbusho'] as sw
)
insert into public.banner_packages (banner_id, event_id, category, features_en, features_sw, sort_order)
select banner.id, e.id, c.category, package.en, package.sw, c.sort_order
from banner, package,
  (values ('half_marathon', 'Half Marathon (21.1km)', 1),
          ('trail_run', 'Trail Run (10km)', 2),
          ('fun_run', 'Fun Run (5km)', 3),
          ('walking_safari', 'Walking Safari (2.5km)', 4)) as c(category, event_name, sort_order)
join public.events e on e.name_en = c.event_name and e.is_active;

-- "Event Program" on the home page.
delete from public.event_types;

with types as (
  insert into public.event_types
    (slug, title_en, title_sw, subtitle_en, subtitle_sw, description_en, description_sw,
     highlight_en, highlight_sw, icon, color, image, sort_order)
  values
    ('races', 'Marathon & Races', 'Mbio za Marathon',
     '21.1 km · 10 km · 5 km · 2.5 km', 'km 21.1 · km 10 · km 5 · km 2.5',
     'Half Marathon, a Trail Run through Mwanga''s natural scenery, a Fun Run, and the 2.5 km Walking Safari for children, elders and families.',
     'Nusu Marathon, Trail Run katika mandhari ya asili ya Mwanga, Fun Run, na Walking Safari ya kilomita 2.5 kwa watoto, wazee na familia.',
     'A medal for every finisher', 'Medali kwa kila atakayemaliza',
     'faRunning', 'from-primary to-secondary', '/assets/images/2026/runners-group.jpg', 1),
    ('utalii-festival', 'Mwanga Utalii Festival', 'Mwanga Utalii Festivals',
     'Music, culture & food', 'Muziki, utamaduni na vyakula',
     'Performances by new-generation artists, traditional ngoma and music, traditional food and the Ndafu Zone — celebrating our culture and showcasing Mwanga.',
     'Burudani kutoka kwa wasanii wa kizazi kipya, ngoma za asili, maonyesho ya vyakula vya asili pamoja na Ndafu Zone — kuenzi utamaduni wetu na kutangaza utalii wa Mwanga.',
     'Ndafu Zone', 'Ndafu Zone',
     'faMusic', 'from-secondary to-primary', '/assets/images/2026/maasai-culture.jpg', 2),
    ('tourism-environment', 'Tourism & Environment', 'Utalii na Mazingira',
     'Mwanga yetu, utalii wetu', 'Mwanga yetu, utalii wetu',
     'Exhibitions of Mwanga and Kilimanjaro attractions, tree planting, clean-up campaigns and education on conservation and domestic tourism.',
     'Maonesho ya vivutio vya utalii vya Mwanga na Kilimanjaro, upandaji wa miti, kampeni za usafi na elimu kuhusu uhifadhi wa mazingira na utalii wa ndani.',
     'Tree planting', 'Upandaji wa miti',
     'faTree', 'from-primary to-secondary', '/assets/images/2026/runner-scenic-road.jpg', 3),
    ('community-health', 'Community & Health', 'Jamii na Afya',
     'Mothers, children and youth', 'Akina mama, watoto na vijana',
     'Part of the festival supports mothers and children in Mwanga — visiting maternity wards, supporting child vaccinations and training young mothers — alongside activities for youth and children.',
     'Sehemu ya tamasha inasaidia akina mama na watoto Mwanga — kutembelea wodi za wazazi, kusaidia chanjo za watoto na kutoa mafunzo kwa kina mama wachanga — pamoja na shughuli za vijana na watoto.',
     'Support for maternity wards', 'Msaada kwa wodi za wazazi',
     'faHospital', 'from-secondary to-primary', '/assets/images/2026/family-walk.jpg', 4)
  returning id, slug
)
insert into public.event_features (event_type_id, text_en, text_sw, icon, sort_order)
select types.id, f.text_en, f.text_sw, f.icon, f.sort_order
from types
join (values
  ('races', 'Official T-shirt, drawstring bag, wristband and bib', 'T-shirt rasmi, mfuko, kikuku na namba ya mkimbiaji', 'faTicket', 1),
  ('races', 'Water stations and fresh fruit', 'Vituo vya maji na matunda safi', 'faUtensils', 2),
  ('races', 'Medals and prizes for winners and best clubs', 'Medali na zawadi kwa washindi na vilabu bora', 'faStar', 3),
  ('races', 'Tug of war between running clubs', 'Mchezo wa kuvuta kamba kati ya vilabu', 'faUserGroup', 4),
  ('utalii-festival', 'New-generation artists', 'Wasanii wa kizazi kipya', 'faMusic', 1),
  ('utalii-festival', 'Traditional ngoma and music', 'Ngoma na muziki wa asili', 'faMasksTheater', 2),
  ('utalii-festival', 'Traditional food and the Ndafu Zone', 'Vyakula vya asili na Ndafu Zone', 'faDrumstickBite', 3),
  ('utalii-festival', 'Arts and crafts exhibitions', 'Maonesho ya sanaa na kazi za mikono', 'faGift', 4),
  ('tourism-environment', 'Mwanga and Kilimanjaro attractions', 'Vivutio vya Mwanga na Kilimanjaro', 'faStar', 1),
  ('tourism-environment', 'Tree planting in schools and health centres', 'Upandaji wa miti mashuleni na vituo vya afya', 'faTree', 2),
  ('tourism-environment', 'Conservation and domestic tourism education', 'Elimu ya uhifadhi na utalii wa ndani', 'faCalendarCheck', 3),
  ('tourism-environment', 'Business and investment exhibitions', 'Maonesho ya biashara na fursa za uwekezaji', 'faTicket', 4),
  ('community-health', 'Visits to maternity wards with supplies', 'Kutembelea wodi za wazazi na kutoa mahitaji', 'faHospital', 1),
  ('community-health', 'Support for child vaccinations', 'Kusaidia chanjo muhimu za watoto', 'faHospital', 2),
  ('community-health', 'Youth talent shows and competitions', 'Maonesho ya vipaji na mashindano ya vijana', 'faStar', 3),
  ('community-health', 'Games and activities for children', 'Michezo na shughuli za watoto', 'faUserGroup', 4)
) as f(slug, text_en, text_sw, icon, sort_order) on f.slug = types.slug;

-- Race day overview (TO CONFIRM: exact times once the official programme is ready).
delete from public.schedule_days;

with day as (
  insert into public.schedule_days (day_en, day_sw, date_en, date_sw, day_identifier, sort_order)
  values ('Race Day', 'Siku ya Mashindano', 'Sunday, 20 December 2026', 'Jumapili, 20 Desemba 2026', 'race-day', 1)
  returning id
)
insert into public.schedule_events
  (schedule_day_id, time_en, time_sw, title_en, title_sw, location_en, location_sw, description_en, description_sw, icon, sort_order)
select day.id, e.*
from day, (values
  ('Morning', 'Asubuhi', 'Races', 'Mashindano ya mbio',
   'C.D. Msuya Stadium', 'Uwanja wa C.D. Msuya',
   'Half Marathon (21.1 km), Trail Run (10 km), Fun Run (5 km) and the 2.5 km Walking Safari.',
   'Nusu Marathon (km 21.1), Trail Run (km 10), Fun Run (km 5) na Walking Safari ya km 2.5.',
   'faRunning', 1),
  ('Midday', 'Mchana', 'Awards & tug of war', 'Zawadi na kuvuta kamba',
   'C.D. Msuya Stadium', 'Uwanja wa C.D. Msuya',
   'Medals and prizes for the winners and best clubs, and the tug-of-war contest between running clubs.',
   'Medali na zawadi kwa washindi na vilabu bora, na mashindano ya kuvuta kamba kati ya vilabu.',
   'faAward', 2),
  ('Afternoon – evening', 'Mchana – jioni', 'Mwanga Utalii Festival', 'Mwanga Utalii Festivals',
   'C.D. Msuya Stadium', 'Uwanja wa C.D. Msuya',
   'New-generation artists, traditional ngoma, traditional food and the Ndafu Zone.',
   'Wasanii wa kizazi kipya, ngoma za asili, vyakula vya asili na Ndafu Zone.',
   'faMusic', 3),
  ('All day', 'Siku nzima', 'Exhibitions', 'Maonesho',
   'C.D. Msuya Stadium', 'Uwanja wa C.D. Msuya',
   'Tourism attractions of Mwanga and Kilimanjaro, crafts, local products and business opportunities.',
   'Vivutio vya utalii vya Mwanga na Kilimanjaro, kazi za mikono, bidhaa za ndani na fursa za biashara.',
   'faTree', 4)
) as e(time_en, time_sw, title_en, title_sw, location_en, location_sw, description_en, description_sw, icon, sort_order);

-- What visitors now see
select 'race: ' || name_en || ' — TZS ' || local_price || ' / USD ' || foreign_price || (case when is_kids_event then ' (kids)' else '' end)
from public.events where is_active order by sort_order;
select 'banner: ' || title_en || ', registration until ' || registration_end_date || ', ' || (select count(*) from public.banner_packages p where p.banner_id = b.id) || ' packages'
from public.marathon_banners b where is_active;
select 'event program: ' || count(*) || ' sections' from public.event_types;
select 'schedule: ' || count(*) || ' items' from public.schedule_events;
