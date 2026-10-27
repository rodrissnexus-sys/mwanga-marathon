-- Generate registration_id with a column default instead of a trigger, so
-- inserts (and the generated TypeScript types) treat it as optional.

create function private.next_registration_id()
returns text
language sql
volatile
set search_path = ''
as $$
  select 'MWF-'
    || to_char(now() at time zone 'Africa/Dar_es_Salaam', 'YYYY')
    || '-'
    || lpad(nextval('public.registration_number_seq')::text, 5, '0');
$$;

-- Inserts run as the secret-key role, which needs to call the default.
grant usage on schema private to service_role;
grant execute on function private.next_registration_id() to service_role;
grant usage on sequence public.registration_number_seq to service_role;

alter table public.registrations alter column registration_id set default private.next_registration_id();

drop trigger registrations_set_registration_id on public.registrations;
drop function private.set_registration_id();
