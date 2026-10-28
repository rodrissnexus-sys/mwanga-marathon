-- Like the other private tables: no access at all with the public key, and
-- staff can only read the payment log (the trigger writes it).
revoke all on public.payment_events from anon;
revoke insert, update, delete, truncate on public.payment_events from authenticated;
