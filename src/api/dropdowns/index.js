import { api } from '../client';
import { ENDPOINTS } from '../config';

export const fetchEvents = async () => {
    try {
        const response = await api.get(ENDPOINTS.DROPDOWNS.EVENTS).json();
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch events'
        };
    }
};

export const fetchShirtSizes = async (isKids = false) => {
    try {
        const url = `${ENDPOINTS.DROPDOWNS.SHIRT_SIZES}${isKids ? '?is_kids_size=true' : ''}`;
        const response = await api.get(url).json();
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch shirt sizes'
        };
    }
};

export const fetchCollectionVenues = async () => {
    try {
        const response = await api.get(ENDPOINTS.DROPDOWNS.COLLECTION_VENUES).json();
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch collection venues'
        };
    }
};

export const fetchCountries = async () => {
    try {
        const response = await api.get(ENDPOINTS.DROPDOWNS.COUNTRIES).json();
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch countries'
        };
    }
};

export const fetchGenders = async () => {
    try {
        const response = await api.get(ENDPOINTS.DROPDOWNS.GENDERS).json();
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch genders'
        };
    }
};
