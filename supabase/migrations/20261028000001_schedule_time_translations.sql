-- Schedule times can be words ("Morning", "Afternoon – evening"), so they
-- need a Swahili version like the other schedule texts.

alter table public.schedule_events rename column time to time_en;
alter table public.schedule_events add column time_sw text;

comment on column public.schedule_events.time_en is 'Shown as-is, e.g. "08:00" or "Morning".';

update public.schedule_events set time_sw = case time_en
  when 'Morning' then 'Asubuhi'
  when 'Midday' then 'Mchana'
  when 'Afternoon – evening' then 'Mchana – jioni'
  when 'All day' then 'Siku nzima'
end;
