import { createClient } from '@/lib/supabase/client';
import { currentLocale, failure, localize, toLocaleColumns } from '@/lib/content';

const EVENT_TYPE_TEXT = ['title', 'subtitle', 'description', 'highlight'];
const EVENT_TYPE_SHARED = ['icon', 'color', 'image', 'is_active', 'sort_order'];
const FEATURE_TEXT = ['text'];
const FEATURE_SHARED = ['icon', 'sort_order', 'is_active'];

const DAY_TEXT = ['day', 'date'];
const DAY_SHARED = ['day_identifier', 'is_active', 'sort_order'];
const SCHEDULE_EVENT_TEXT = ['title', 'location', 'description'];
const SCHEDULE_EVENT_SHARED = ['time', 'icon', 'sort_order', 'is_active'];

const pick = (values, fields) =>
    Object.fromEntries(fields.filter((field) => values[field] !== undefined).map((field) => [field, values[field]]));

// Visitors only receive active rows (RLS). Signed-in staff also get inactive
// ones so the dashboard can re-enable them.
const isSignedIn = async (supabase) => Boolean((await supabase.auth.getSession()).data.session);

const bySortOrder = (rows) =>
    [...(rows ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);

// Event types keep the old API's `event_id` name for their slug.
const toEventType = (row) => ({ ...row, event_id: row.slug, features: bySortOrder(row.features) });
const toScheduleDay = (row) => ({ ...row, events: bySortOrder(row.events) });

/**
 * Keep a parent's child rows (features / schedule events) in line with the
 * submitted list: update rows that have an id, insert new ones, delete the rest.
 */
async function syncChildren(supabase, { table, parentColumn, parentId, items, textFields, sharedFields, locale }) {
    const { data: existing, error } = await supabase.from(table).select('id').eq(parentColumn, parentId);
    if (error) throw error;

    const keep = new Set();
    for (const item of items) {
        const shared = pick(item, sharedFields);
        if (item.id) {
            keep.add(item.id);
            const { error: updateError } = await supabase
                .from(table)
                .update({ ...shared, ...toLocaleColumns(item, textFields, { locale }) })
                .eq('id', item.id)
                .eq(parentColumn, parentId);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase.from(table).insert({
                ...shared,
                ...toLocaleColumns(item, textFields, { locale, isNew: true }),
                [parentColumn]: parentId,
            });
            if (insertError) throw insertError;
        }
    }

    const stale = (existing ?? []).map((row) => row.id).filter((id) => !keep.has(id));
    if (stale.length) {
        const { error: deleteError } = await supabase.from(table).delete().in('id', stale);
        if (deleteError) throw deleteError;
    }
}

// ---------------------------------------------------------------------------
// Event types ("Event Program" on the home page)
// ---------------------------------------------------------------------------

const EVENT_TYPE_SELECT = '*, features:event_features(*)';

/**
 * Fetch all event types with their features
 * @returns {Promise<Object>} { success, data: [{ id, event_id, title, ..., features: [...] }] }
 */
export const fetchEventTypes = async () => {
    try {
        const supabase = createClient();
        let query = supabase.from('event_types').select(EVENT_TYPE_SELECT);
        if (!(await isSignedIn(supabase))) query = query.eq('is_active', true);
        const { data, error } = await query.order('sort_order').order('id');
        if (error) throw error;
        return { success: true, data: localize(data).map(toEventType) };
    } catch (error) {
        return failure(error, 'Failed to fetch event types');
    }
};

export const fetchEventTypeById = async (id) => {
    try {
        const { data, error } = await createClient().from('event_types').select(EVENT_TYPE_SELECT).eq('id', id).single();
        if (error) throw error;
        return { success: true, data: toEventType(localize(data)) };
    } catch (error) {
        return failure(error, 'Failed to fetch event type');
    }
};

const saveEventType = async (id, values) => {
    const supabase = createClient();
    const locale = currentLocale();
    const isNew = !id;
    const row = {
        ...pick(values, EVENT_TYPE_SHARED),
        ...(values.event_id !== undefined ? { slug: values.event_id } : {}),
        ...toLocaleColumns(values, EVENT_TYPE_TEXT, { locale, isNew }),
    };

    const { data, error } = isNew
        ? await supabase.from('event_types').insert(row).select('id').single()
        : await supabase.from('event_types').update(row).eq('id', id).select('id').single();
    if (error) throw error;

    if (Array.isArray(values.features)) {
        await syncChildren(supabase, {
            table: 'event_features', parentColumn: 'event_type_id', parentId: data.id,
            items: values.features, textFields: FEATURE_TEXT, sharedFields: FEATURE_SHARED, locale,
        });
    }
    return (await fetchEventTypeById(data.id)).data;
};

export const createEventType = async (eventTypeData) => {
    try {
        const data = await saveEventType(null, eventTypeData);
        return { success: true, message: 'Event type created successfully', data };
    } catch (error) {
        return failure(error, 'Failed to create event type');
    }
};

export const updateEventType = async (id, eventTypeData) => {
    try {
        const data = await saveEventType(id, eventTypeData);
        return { success: true, message: 'Event type updated successfully', data };
    } catch (error) {
        return failure(error, 'Failed to update event type');
    }
};

export const deleteEventType = async (id) => {
    try {
        const { error } = await createClient().from('event_types').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'Event type deleted successfully' };
    } catch (error) {
        return failure(error, 'Failed to delete event type');
    }
};

// ---------------------------------------------------------------------------
// Schedule (days with their events)
// ---------------------------------------------------------------------------

const DAY_SELECT = '*, events:schedule_events(*)';

/**
 * Fetch the schedule: days with their events
 * @returns {Promise<Object>} { success, data: [{ id, day, date, events: [...] }] }
 */
export const fetchSchedule = async () => {
    try {
        const supabase = createClient();
        const signedIn = await isSignedIn(supabase);
        let query = supabase.from('schedule_days').select(DAY_SELECT);
        if (!signedIn) query = query.eq('is_active', true);
        const { data, error } = await query.order('sort_order').order('id');
        if (error) throw error;
        return {
            success: true,
            data: localize(data).map((day) => {
                const shaped = toScheduleDay(day);
                // The public schedule only lists active events (as before).
                return signedIn ? shaped : { ...shaped, events: shaped.events.filter((event) => event.is_active) };
            }),
        };
    } catch (error) {
        return failure(error, 'Failed to fetch schedule');
    }
};

export const fetchScheduleDayById = async (id) => {
    try {
        const { data, error } = await createClient().from('schedule_days').select(DAY_SELECT).eq('id', id).single();
        if (error) throw error;
        return { success: true, data: toScheduleDay(localize(data)) };
    } catch (error) {
        return failure(error, 'Failed to fetch schedule day');
    }
};

const saveScheduleDay = async (id, values) => {
    const supabase = createClient();
    const locale = currentLocale();
    const isNew = !id;
    const row = { ...pick(values, DAY_SHARED), ...toLocaleColumns(values, DAY_TEXT, { locale, isNew }) };

    const { data, error } = isNew
        ? await supabase.from('schedule_days').insert(row).select('id').single()
        : await supabase.from('schedule_days').update(row).eq('id', id).select('id').single();
    if (error) throw error;

    if (Array.isArray(values.events)) {
        await syncChildren(supabase, {
            table: 'schedule_events', parentColumn: 'schedule_day_id', parentId: data.id,
            items: values.events, textFields: SCHEDULE_EVENT_TEXT, sharedFields: SCHEDULE_EVENT_SHARED, locale,
        });
    }
    return (await fetchScheduleDayById(data.id)).data;
};

export const createScheduleDay = async (scheduleDayData) => {
    try {
        const data = await saveScheduleDay(null, scheduleDayData);
        return { success: true, message: 'Schedule day created successfully', data };
    } catch (error) {
        return failure(error, 'Failed to create schedule day');
    }
};

export const updateScheduleDay = async (id, scheduleDayData) => {
    try {
        const data = await saveScheduleDay(id, scheduleDayData);
        return { success: true, message: 'Schedule day updated successfully', data };
    } catch (error) {
        return failure(error, 'Failed to update schedule day');
    }
};

export const deleteScheduleDay = async (id) => {
    try {
        const { error } = await createClient().from('schedule_days').delete().eq('id', id);
        if (error) throw error;
        return { success: true, message: 'Schedule day deleted successfully' };
    } catch (error) {
        return failure(error, 'Failed to delete schedule day');
    }
};
