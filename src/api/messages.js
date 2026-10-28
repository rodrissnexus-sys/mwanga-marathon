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

/** Footer newsletter sign-ups, newest first. */
export const getSubscribers = async ({ page = 1, pageSize = 50 } = {}) => {
    try {
        const from = (page - 1) * pageSize;
        const { data, error, count } = await createClient()
            .from('newsletter_subscribers')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, from + pageSize - 1);
        if (error) throw error;
        return { success: true, data, total: count ?? 0 };
    } catch (error) {
        return failure(error, 'Failed to load subscribers');
    }
};

/** Download every subscriber as a CSV file (email, site language, date). */
export const exportSubscribersCsv = async () => {
    try {
        const supabase = createClient();
        const rows = [];
        for (let from = 0; ; from += 1000) {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('email, locale, created_at')
                .order('created_at')
                .range(from, from + 999);
            if (error) throw error;
            rows.push(...data);
            if (data.length < 1000) break;
        }
        const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const csv = ['Email,Site language,Subscribed at', ...rows.map((r) => [r.email, r.locale, r.created_at].map(cell).join(','))].join('\r\n');
        const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        const link = Object.assign(document.createElement('a'), { href: url, download: `mwafem-newsletter-${new Date().toISOString().slice(0, 10)}.csv` });
        link.click();
        URL.revokeObjectURL(url);
        return { success: true, count: rows.length };
    } catch (error) {
        return failure(error, 'Failed to export subscribers');
    }
};
