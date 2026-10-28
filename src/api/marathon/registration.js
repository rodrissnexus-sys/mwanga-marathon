import { createClient } from '@/lib/supabase/client';
import { currentLocale, failure, localize } from '@/lib/content';
import * as server from '@/server/registrations';

// Same nested shape the Laravel API returned (event, shirt_size, …).
const RELATIONS = `*,
  event:events(*),
  shirt_size:shirt_sizes!registrations_shirt_size_id_fkey(*),
  kids_shirt_size:shirt_sizes!registrations_kids_shirt_size_id_fkey(*),
  collection_venue:collection_venues(*),
  nationality:countries!registrations_nationality_id_fkey(*),
  country:countries!registrations_country_id_fkey(*),
  gender:genders(*)`;

const PAGE = 1000; // Supabase returns at most 1000 rows per request

const shape = (rows) => localize(rows);

/**
 * Register a participant for the marathon (public form)
 * @param {Object} registrationData - Form values (camelCase, as collected by the form)
 */
export const registerParticipant = async (registrationData) => {
    try {
        return await server.registerParticipant({
            first_name: registrationData.firstName,
            last_name: registrationData.lastName,
            email: registrationData.email,
            phone_number: registrationData.phoneNumber,
            event_id: registrationData.event_id,
            shirt_size_id: registrationData.shirt_size_id,
            kids_shirt_size_id: registrationData.kids_shirt_size_id,
            collection_venue_id: registrationData.collection_venue_id,
            nationality_id: registrationData.nationality_id,
            nationality_category: registrationData.nationality || null,
            id_number: registrationData.idNumber,
            passport_number: registrationData.passportNumber,
            date_of_birth: registrationData.dateOfBirth,
            gender_id: registrationData.gender_id,
            country_id: registrationData.country_id,
            emergency_contact_name: registrationData.emergencyContactName,
            emergency_contact_number: registrationData.emergencyContactNumber,
            postal_code: registrationData.postalCode,
            voucher_code: registrationData.voucherCode,
        }, currentLocale());
    } catch (error) {
        return failure(error, 'An error occurred during registration');
    }
};

// Search box + filters shared by the list, the page view and the CSV export.
function applyFilters(query, { search, eventId, paymentStatus, locale } = {}) {
    query = query.is('deleted_at', null);
    const term = search?.trim().toLowerCase();
    if (term) query = query.ilike('search_text', `%${term.replace(/[%_,()]/g, ' ')}%`);
    if (eventId) query = query.eq('event_id', eventId);
    if (paymentStatus) query = query.eq('payment_status', paymentStatus);
    if (locale) query = query.eq('locale', locale);
    return query;
}

// Every matching row, fetched 1000 at a time.
async function fetchAll(filters, order = 'created_at') {
    const supabase = createClient();
    const rows = [];
    for (let from = 0; ; from += PAGE) {
        const { data, error } = await applyFilters(supabase.from('registrations').select(RELATIONS), filters)
            .order(order, { ascending: false })
            .order('id', { ascending: false })
            .range(from, from + PAGE - 1);
        if (error) throw error;
        rows.push(...data);
        if (data.length < PAGE) return shape(rows);
    }
}

/**
 * All registrations (dashboard charts and metrics)
 */
export const getAllRegistrations = async (filters) => {
    try {
        return { success: true, data: await fetchAll(filters) };
    } catch (error) {
        return failure(error, 'Failed to fetch registrations');
    }
};

/**
 * One page of registrations for the dashboard table.
 * @param {Object} options - { page (1-based), pageSize, orderBy, ascending, search, eventId, paymentStatus, locale }
 * @returns {Promise<Object>} { success, data, total }
 */
export const getRegistrationsPage = async ({ page = 1, pageSize = 25, orderBy = 'created_at', ascending = false, ...filters } = {}) => {
    try {
        const from = (page - 1) * pageSize;
        const { data, error, count } = await applyFilters(
            createClient().from('registrations').select(RELATIONS, { count: 'exact' }),
            filters,
        )
            .order(orderBy, { ascending })
            .order('id', { ascending })
            .range(from, from + pageSize - 1);
        if (error) throw error;
        return { success: true, data: shape(data), total: count ?? 0 };
    } catch (error) {
        return failure(error, 'Failed to fetch registrations');
    }
};

const shapeResult = (result) => (result.success ? { ...result, data: shape([result.data])[0] } : result);

/**
 * Confirm a payment (admins and moderators).
 * @param {Object} details - { method, reference, amount, currency, notes, allowDuplicate }
 */
export const confirmPayment = async (registrationId, details) => {
    try {
        return shapeResult(await server.confirmPayment(registrationId, details));
    } catch (error) {
        return failure(error, 'Failed to confirm payment');
    }
};

/** No matching payment was found. */
export const markPaymentFailed = async (registrationId, reason) => {
    try {
        return shapeResult(await server.markPaymentFailed(registrationId, reason));
    } catch (error) {
        return failure(error, 'Failed to update payment');
    }
};

/** Back to pending (undoing a confirmation is admin-only). */
export const reopenPayment = async (registrationId, reason) => {
    try {
        return shapeResult(await server.reopenPayment(registrationId, reason));
    } catch (error) {
        return failure(error, 'Failed to reopen payment');
    }
};

/** Number of registrations per payment status for the current search/filters. */
export const countByPaymentStatus = async (filters = {}) => {
    try {
        const supabase = createClient();
        const statuses = ['pending', 'confirmed', 'failed'];
        const results = await Promise.all(statuses.map((paymentStatus) =>
            applyFilters(supabase.from('registrations').select('id', { count: 'exact', head: true }), { ...filters, paymentStatus })));
        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;
        return { success: true, data: Object.fromEntries(statuses.map((s, i) => [s, results[i].count ?? 0])) };
    } catch (error) {
        return failure(error, 'Failed to count payments');
    }
};

/** Every payment status change for one registration, newest first. */
export const getPaymentHistory = async (registrationId) => {
    try {
        const { data, error } = await createClient()
            .from('payment_events')
            .select('*')
            .eq('registration_id', registrationId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return failure(error, 'Failed to load payment history');
    }
};

/** One registration with everything the receipt needs. */
export const getRegistration = async (id) => {
    try {
        const { data, error } = await createClient().from('registrations').select(RELATIONS).eq('id', id).single();
        if (error) throw error;
        return { success: true, data: shape([data])[0] };
    } catch (error) {
        return failure(error, 'Failed to load registration');
    }
};

const CSV_COLUMNS = [
    ['Registration ID', (r) => r.registration_id],
    ['Registered at', (r) => r.created_at],
    ['Site language', (r) => r.locale],
    ['First name', (r) => r.first_name],
    ['Last name', (r) => r.last_name],
    ['Email', (r) => r.email],
    ['Phone', (r) => r.phone_number],
    ['Event', (r) => r.event?.name],
    ['T-shirt', (r) => r.shirt_size?.code],
    ['Kids t-shirt', (r) => r.kids_shirt_size?.code],
    ['Collection venue', (r) => r.collection_venue?.name],
    ['Gender', (r) => r.gender?.name],
    ['Date of birth', (r) => r.date_of_birth],
    ['Nationality', (r) => r.nationality?.name],
    ['Country', (r) => r.country?.name],
    ['ID number', (r) => r.id_number],
    ['Passport number', (r) => r.passport_number],
    ['Emergency contact', (r) => r.emergency_contact_name],
    ['Emergency number', (r) => r.emergency_contact_number],
    ['Postal code', (r) => r.postal_code],
    ['Voucher code', (r) => r.voucher_code],
    ['Payment status', (r) => r.payment_status],
    ['Payment confirmed at', (r) => r.payment_confirmed_at],
    ['Confirmed by', (r) => r.payment_confirmed_by_name],
    ['Payment method', (r) => r.payment_method],
    ['Payment reference', (r) => r.payment_reference],
    ['Amount received', (r) => r.payment_amount],
    ['Currency', (r) => r.payment_currency],
    ['Payment notes', (r) => r.payment_notes],
];

const csvCell = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    // Quote, and stop spreadsheet apps from running cells that start with = + - @
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
};

/**
 * Download the registrations matching the current filters as a CSV file.
 */
export const exportRegistrationsCsv = async (filters = {}) => {
    try {
        const rows = await fetchAll(filters);
        const lines = [
            CSV_COLUMNS.map(([title]) => csvCell(title)).join(','),
            ...rows.map((row) => CSV_COLUMNS.map(([, get]) => csvCell(get(row))).join(',')),
        ];
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mwafem-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return { success: true, count: rows.length };
    } catch (error) {
        return failure(error, 'Failed to export registrations');
    }
};
