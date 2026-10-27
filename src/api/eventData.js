import { getTokenKey } from '@/api/config';
import { api } from './client';
import { ENDPOINTS, getApiBaseUrl } from './config';

// Cache for API responses to prevent redundant requests
const apiCache = {
    eventTypes: null,
    schedule: null,
    cacheTime: {
        eventTypes: null,
        schedule: null
    },
    // Cache expiration time in milliseconds (5 minutes)
    CACHE_EXPIRATION: 5 * 60 * 1000
};

/**
 * Fetch all event types with their features
 * 
 * @param {boolean} forceRefresh - Whether to bypass cache and force a new request
 * @returns {Promise<Object>} Response with event types data
 */
export const fetchEventTypes = async (forceRefresh = false) => {
    try {
        // Check cache first if not forcing refresh
        if (!forceRefresh && 
            apiCache.eventTypes && 
            apiCache.cacheTime.eventTypes && 
            (Date.now() - apiCache.cacheTime.eventTypes) < apiCache.CACHE_EXPIRATION) {
            console.log('Using cached event types data');
            return apiCache.eventTypes;
        }
        
        // Set a longer timeout for this request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await api.get(ENDPOINTS.EVENT_DATA.EVENT_TYPES, {
            signal: controller.signal,
            timeout: 15000 // 15 seconds
        }).json();
        
        clearTimeout(timeoutId);
        
        // Cache the successful response
        apiCache.eventTypes = response;
        apiCache.cacheTime.eventTypes = Date.now();
        
        return response;
    } catch (error) {
        console.error('Error fetching event types:', error);
        
        // If we have cached data, return it on error
        if (apiCache.eventTypes) {
            console.log('Returning cached event types data after error');
            return apiCache.eventTypes;
        }
        
        return {
            success: false,
            error: error.name === 'AbortError' 
                ? 'Request timed out' 
                : (error.message || 'Failed to fetch event types')
        };
    }
};

/**
 * Fetch a specific event type by ID
 * 
 * @param {number} id - The ID of the event type to fetch
 * @returns {Promise<Object>} Response with event type data
 */
export const fetchEventTypeById = async (id) => {
    try {
        // Check if we have it in cache first
        if (apiCache.eventTypes && apiCache.eventTypes.success) {
            const cachedEventType = apiCache.eventTypes.data.find(item => item.id === id || item.event_id === id);
            if (cachedEventType) {
                console.log('Using cached event type data for ID:', id);
                return {
                    success: true,
                    data: cachedEventType
                };
            }
        }
        
        const response = await api.get(`${ENDPOINTS.EVENT_DATA.EVENT_TYPES}/${id}`, {
            timeout: 10000 // 10 seconds
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch event type'
        };
    }
};

/**
 * Fetch all schedule days with their events
 * 
 * @param {boolean} forceRefresh - Whether to bypass cache and force a new request
 * @returns {Promise<Object>} Response with schedule days data
 */
export const fetchSchedule = async (forceRefresh = false) => {
    try {
        // Check cache first if not forcing refresh
        if (!forceRefresh && 
            apiCache.schedule && 
            apiCache.cacheTime.schedule && 
            (Date.now() - apiCache.cacheTime.schedule) < apiCache.CACHE_EXPIRATION) {
            console.log('Using cached schedule data');
            return apiCache.schedule;
        }
        
        // Set a longer timeout for this request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await api.get(ENDPOINTS.EVENT_DATA.SCHEDULE, {
            signal: controller.signal,
            timeout: 15000 // 15 seconds
        }).json();
        
        clearTimeout(timeoutId);
        
        // Cache the successful response
        apiCache.schedule = response;
        apiCache.cacheTime.schedule = Date.now();
        
        return response;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        
        // If we have cached data, return it on error
        if (apiCache.schedule) {
            console.log('Returning cached schedule data after error');
            return apiCache.schedule;
        }
        
        return {
            success: false,
            error: error.name === 'AbortError' 
                ? 'Request timed out' 
                : (error.message || 'Failed to fetch schedule')
        };
    }
};

/**
 * Fetch a specific schedule day by ID
 * 
 * @param {number} id - The ID of the schedule day to fetch
 * @returns {Promise<Object>} Response with schedule day data
 */
export const fetchScheduleDayById = async (id) => {
    try {
        const response = await api.get(`${ENDPOINTS.EVENT_DATA.SCHEDULE}/${id}`, {
            timeout: 10000 // 10 seconds
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch schedule day'
        };
    }
};

// Admin functions (protected by auth:sanctum)

/**
 * Create a new event type
 * 
 * @param {Object} eventTypeData - The event type data to create
 * @returns {Promise<Object>} Response with created event type
 */
export const createEventType = async (eventTypeData) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        const response = await api.post(ENDPOINTS.EVENT_DATA.EVENT_TYPES, {
            json: eventTypeData,
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to create event type'
        };
    }
};

/**
 * Update an existing event type
 * 
 * @param {number} id - The ID of the event type to update
 * @param {Object} eventTypeData - The updated event type data
 * @returns {Promise<Object>} Response with updated event type
 */
export const updateEventType = async (id, eventTypeData) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        const response = await api.put(`${ENDPOINTS.EVENT_DATA.EVENT_TYPES}/${id}`, {
            json: eventTypeData,
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to update event type'
        };
    }
};

/**
 * Delete an event type
 * 
 * @param {number} id - The ID of the event type to delete
 * @returns {Promise<Object>} Response with success message
 */
export const deleteEventType = async (id) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        const response = await api.delete(`${ENDPOINTS.EVENT_DATA.EVENT_TYPES}/${id}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to delete event type'
        };
    }
};

/**
 * Create a new schedule day
 * 
 * @param {Object} scheduleDayData - The schedule day data to create
 * @returns {Promise<Object>} Response with created schedule day
 */
export const createScheduleDay = async (scheduleDayData) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        // Debug: Log token status
        console.log('Auth token present:', !!token);
        
        // Use apiClient instead of direct api call to ensure proper authentication
        const response = await fetch(`${getApiBaseUrl()}/${ENDPOINTS.EVENT_DATA.SCHEDULE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(scheduleDayData)
        });
        
        // Debug: Log response status
        console.log('API Response Status:', response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('API Error:', data);
            return {
                success: false,
                error: data.message || 'Failed to create schedule day'
            };
        }
        
        return {
            success: true,
            ...data
        };
    } catch (error) {
        console.error('Schedule day creation error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create schedule day'
        };
    }
};

/**
 * Update an existing schedule day
 * 
 * @param {number} id - The ID of the schedule day to update
 * @param {Object} scheduleDayData - The updated schedule day data
 * @returns {Promise<Object>} Response with updated schedule day
 */
export const updateScheduleDay = async (id, scheduleDayData) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        const response = await api.put(`${ENDPOINTS.EVENT_DATA.SCHEDULE}/${id}`, {
            json: scheduleDayData,
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to update schedule day'
        };
    }
};

/**
 * Delete a schedule day
 * 
 * @param {number} id - The ID of the schedule day to delete
 * @returns {Promise<Object>} Response with success message
 */
export const deleteScheduleDay = async (id) => {
    try {
        // Get auth token from localStorage
        const token = localStorage.getItem(getTokenKey());
        
        const response = await api.delete(`${ENDPOINTS.EVENT_DATA.SCHEDULE}/${id}`, {
            headers: token ? {
                'Authorization': `Bearer ${token}`
            } : {}
        }).json();
        
        return response;
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to delete schedule day'
        };
    }
};
