-- Name of the staff member who handled a message, kept on the row:
-- moderators can't read other staff profiles, so a join wouldn't show it.
alter table public.contact_messages
  add column handled_by_name text check (char_length(handled_by_name) <= 255);
