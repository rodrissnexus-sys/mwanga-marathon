import { createClient } from '@/lib/supabase/client';
import { failure, localize } from '@/lib/content';

/**
 * Get recent registrations for dashboard
 * @param {number} limit - Number of registrations to return
 */
export const getRecentRegistrations = async (limit = 5) => {
    try {
        const { data, error } = await createClient()
            .from('registrations')
            .select('*, event:events(*)')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return { success: true, data: localize(data) };
    } catch (error) {
        return failure(error, 'Failed to fetch recent registrations');
    }
};

/**
 * Registrations and confirmed payments per race category, plus the
 * male/female split. (The old API compared registrations against the home
 * page "event types", which never matched; this uses the race categories.)
 */
export const getEventStatistics = async () => {
    try {
        const supabase = createClient();
        const [{ data: events, error: eventsError }, { data: registrations, error: regError }] = await Promise.all([
            supabase.from('events').select('*').order('sort_order'),
            supabase.from('registrations').select('event_id, payment_status, gender:genders(code)').is('deleted_at', null),
        ]);
        if (eventsError) throw eventsError;
        if (regError) throw regError;

        const statistics = localize(events).map((event) => {
            const forEvent = registrations.filter((reg) => reg.event_id === event.id);
            return {
                id: event.id,
                name: event.name,
                registered: forEvent.length,
                capacity: 300, // no capacity per category yet (same default as before)
                completedPayments: forEvent.filter((reg) => reg.payment_status === 'confirmed').length,
            };
        });

        const total = registrations.length;
        const share = (code) =>
            total > 0 ? Math.round((registrations.filter((reg) => reg.gender?.code === code).length / total) * 100) : 0;

        return {
            success: true,
            data: { events: statistics, genderDistribution: { male: share('M'), female: share('F') } },
        };
    } catch (error) {
        return failure(error, 'Failed to fetch event statistics');
    }
};
