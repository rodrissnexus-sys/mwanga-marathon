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

// Localized rows, plus the old column name the dashboard still reads.
const shape = (rows) =>
    localize(rows).map((row) => ({ ...row, payment_confirmation_by: row.payment_confirmed_by_name }));

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
 * @param {Object} options - { page (1-based), pageSize, orderBy, search, eventId, paymentStatus, locale }
 * @returns {Promise<Object>} { success, data, total }
 */
export const getRegistrationsPage = async ({ page = 1, pageSize = 25, orderBy = 'created_at', ...filters } = {}) => {
    try {
        const from = (page - 1) * pageSize;
        const { data, error, count } = await applyFilters(
            createClient().from('registrations').select(RELATIONS, { count: 'exact' }),
            filters,
        )
            .order(orderBy, { ascending: false })
            .order('id', { ascending: false })
            .range(from, from + pageSize - 1);
        if (error) throw error;
        return { success: true, data: shape(data), total: count ?? 0 };
    } catch (error) {
        return failure(error, 'Failed to fetch registrations');
    }
};

/**
 * Confirm payment for a registration (admins and moderators)
 */
export const confirmPayment = async (registrationId, notes = '') => {
    try {
        const result = await server.confirmPayment(registrationId, notes);
        return result.success ? { ...result, data: shape([result.data])[0] } : result;
    } catch (error) {
        return failure(error, 'Failed to confirm payment');
    }
};

/**
 * Registrations with a confirmed payment, newest confirmation first
 */
export const getConfirmedPayments = async (filters = {}) => {
    try {
        return {
            success: true,
            data: await fetchAll({ ...filters, paymentStatus: 'confirmed' }, 'payment_confirmed_at'),
        };
    } catch (error) {
        return failure(error, 'Failed to fetch confirmed payments');
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
