import { createClient } from '@/lib/supabase/client';
import { failure } from '@/lib/content';

/**
 * Contact and partnership messages for the dashboard inbox.
 * @param {Object} options - { page (1-based), pageSize, kind ('contact' | 'partnership'), handled (true | false | undefined) }
 */
export const getMessages = async ({ page = 1, pageSize = 20, kind, handled } = {}) => {
    try {
        let query = createClient()
            .from('contact_messages')
            .select('*', { count: 'exact' });
        if (kind) query = query.eq('kind', kind);
        if (handled === true) query = query.not('handled_at', 'is', null);
        if (handled === false) query = query.is('handled_at', null);
        const from = (page - 1) * pageSize;
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);
        if (error) throw error;
        return { success: true, data, total: count ?? 0 };
    } catch (error) {
        return failure(error, 'Failed to load messages');
    }
};

/** Number of messages nobody has handled yet (sidebar badge). */
export const countUnhandledMessages = async () => {
    const { count } = await createClient()
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .is('handled_at', null);
    return count ?? 0;
};

/** Mark a message as handled by the signed-in staff member ({ id, name }), or reopen it. */
export const setMessageHandled = async (id, handled, staff) => {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('contact_messages')
            .update(handled
                ? { handled_at: new Date().toISOString(), handled_by: staff.id, handled_by_name: staff.name }
                : { handled_at: null, handled_by: null, handled_by_name: null })
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return failure(error, 'Failed to update message');
    }
};
