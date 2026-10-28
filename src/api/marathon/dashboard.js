import { createClient } from '@/lib/supabase/client';
import { failure, localize } from '@/lib/content';
import { expectedFee } from '@/lib/payments';

const PAGE = 1000; // Supabase returns at most 1000 rows per request

const COLUMNS = `id, registration_id, first_name, last_name, phone_number, created_at, event_id, locale,
  payment_status, payment_amount, payment_currency, nationality_category,
  nationality:countries!registrations_nationality_id_fkey(code), gender:genders(code)`;

/**
 * Everything the dashboard overview shows, worked out from one pass over the
 * registrations: counts by payment status, money received and still
 * expected (per currency), per-race progress, the gender split, daily
 * registrations for the last 30 days and the oldest pending payments.
 */
export const getOverview = async () => {
    try {
        const supabase = createClient();
        const { data: events, error: eventsError } = await supabase.from('events').select('*').order('sort_order');
        if (eventsError) throw eventsError;
        const eventsById = new Map(localize(events).map((event) => [event.id, event]));

        const rows = [];
        for (let from = 0; ; from += PAGE) {
            const { data, error } = await supabase
                .from('registrations')
                .select(COLUMNS)
                .is('deleted_at', null)
                .order('created_at', { ascending: true })
                .order('id', { ascending: true })
                .range(from, from + PAGE - 1);
            if (error) throw error;
            rows.push(...data);
            if (data.length < PAGE) break;
        }

        const counts = { total: rows.length, pending: 0, confirmed: 0, failed: 0 };
        const received = { TZS: 0, USD: 0 };
        const outstanding = { TZS: 0, USD: 0 };
        const races = new Map([...eventsById.values()].map((event) => [
            event.id,
            { id: event.id, name: event.name, total: 0, confirmed: 0, pending: 0 },
        ]));
        const genders = { M: 0, F: 0 };

        // last 30 days, Tanzania time
        const dayOf = (date) => new Date(date).toLocaleDateString('en-CA', { timeZone: 'Africa/Dar_es_Salaam' });
        const days = new Map();
        for (let i = 29; i >= 0; i -= 1) days.set(dayOf(Date.now() - i * 86_400_000), 0);

        for (const row of rows) {
            counts[row.payment_status] += 1;
            const race = races.get(row.event_id);
            if (race) {
                race.total += 1;
                if (row.payment_status !== 'failed') race[row.payment_status] += 1;
            }
            if (row.payment_status === 'confirmed' && row.payment_amount !== null && row.payment_currency in received) {
                received[row.payment_currency] += Number(row.payment_amount);
            }
            if (row.payment_status === 'pending') {
                const fee = expectedFee({ ...row, event: eventsById.get(row.event_id) });
                if (fee) outstanding[fee.currency] += fee.amount;
            }
            if (row.gender?.code in genders) genders[row.gender.code] += 1;
            const day = dayOf(row.created_at);
            if (days.has(day)) days.set(day, days.get(day) + 1);
        }

        const oldestPending = rows
            .filter((row) => row.payment_status === 'pending')
            .slice(0, 6)
            .map((row) => ({ ...row, event: eventsById.get(row.event_id) }));

        return {
            success: true,
            data: {
                counts,
                received,
                outstanding,
                races: [...races.values()],
                genders,
                daily: [...days.entries()].map(([date, count]) => ({ date, count })),
                oldestPending,
            },
        };
    } catch (error) {
        return failure(error, 'Failed to load the dashboard');
    }
};
