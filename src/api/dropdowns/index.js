import { createClient } from '@/lib/supabase/client';
import { failure, localize } from '@/lib/content';

// Active rows of a dropdown table, in display order, in the page's language.
const fetchActive = async (table, filter, fallbackError) => {
    try {
        let query = createClient().from(table).select('*').eq('is_active', true);
        if (filter) query = filter(query);
        const { data, error } = await query.order('sort_order').order('id');
        if (error) throw error;
        return { success: true, data: localize(data) };
    } catch (error) {
        return failure(error, fallbackError);
    }
};

/**
 * Fetch all active events (race categories)
 * @returns {Promise<Object>} { success, data: [{ id, name, description, local_price, ..., is_kids_event, distance_km }] }
 */
export const fetchEvents = () => fetchActive('events', null, 'Failed to fetch events');

/**
 * Fetch adult or kids shirt sizes
 * @param {boolean} isKids - true for kids sizes, false for adult sizes
 */
export const fetchShirtSizes = (isKids = false) =>
    fetchActive('shirt_sizes', (query) => query.eq('is_kids_size', isKids), 'Failed to fetch shirt sizes');

export const fetchCollectionVenues = () => fetchActive('collection_venues', null, 'Failed to fetch collection venues');

export const fetchCountries = () => fetchActive('countries', null, 'Failed to fetch countries');

export const fetchGenders = () => fetchActive('genders', null, 'Failed to fetch genders');
