-- Volunteer sign-ups arrive in the dashboard inbox like contact messages;
-- the help area they chose is stored in subject.
alter type public.message_kind add value if not exists 'volunteer';
