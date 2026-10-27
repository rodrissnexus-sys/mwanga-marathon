-- Supabase Auth inserts a new user first and writes app_metadata (where the
-- staff role lives) in a follow-up update, so the insert trigger alone never
-- saw the role. Also react to that update. The profile row stays the source of
-- truth afterwards: later app_metadata changes don't overwrite it.

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_app_meta_data ->> 'role' in ('admin', 'moderator') then
    insert into public.profiles (id, name, email, role)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
      new.email,
      (new.raw_app_meta_data ->> 'role')::public.app_role
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_role_assigned
  after update of raw_app_meta_data on auth.users
  for each row
  when (new.raw_app_meta_data ->> 'role' is distinct from old.raw_app_meta_data ->> 'role')
  execute function private.handle_new_user();
