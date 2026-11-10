-- The organisers ask for the runner's age instead of a date of birth
-- (November 2026). Older registrations keep their date of birth; new ones
-- store only the age. Every registration has one or the other.
alter table public.registrations
  add column if not exists age smallint check (age between 1 and 110);

alter table public.registrations
  alter column date_of_birth drop not null;

alter table public.registrations
  add constraint registrations_age_or_date_of_birth
    check (age is not null or date_of_birth is not null);

comment on column public.registrations.age is
  'Age in years given at registration (replaces date_of_birth from November 2026).';
