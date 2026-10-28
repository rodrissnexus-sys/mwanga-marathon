-- 2026 fees depend on who is running, not on the race (organiser's letter of
-- 15 Oct 2026): adults & youth 11-64, running/jogging club members, students,
-- children 5-10 and elders 65+. Older registrations have no category and are
-- priced by their race as before.
alter table public.registrations
  add column participant_category text
    check (participant_category in ('adult', 'club', 'student', 'child', 'senior'));

comment on column public.registrations.participant_category is
  'Fee category chosen at registration (child/senior follow from the age on race day).';
