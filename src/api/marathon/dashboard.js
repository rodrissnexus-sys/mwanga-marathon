import { api } from '../client';
import { ENDPOINTS } from '../config';

/**
 * Get recent registrations for dashboard
 * @param {number} limit - Number of registrations to return
 * @returns {Promise<Object>} - Response with recent registrations
 */
export const getRecentRegistrations = async (limit = 5) => {
    try {
        const response = await api.get(`${ENDPOINTS.MARATHON.REGISTRATIONS}?limit=${limit}&sort=desc`).json();
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch recent registrations'
        };
    }
};

/**
 * Get event statistics for dashboard
 * @returns {Promise<Object>} - Response with event statistics
 */
export const getEventStatistics = async () => {
    try {
        // First get event types
        const eventTypesResponse = await api.get(ENDPOINTS.EVENT_DATA.EVENT_TYPES).json();
        
        // Then get all registrations to calculate statistics
        const registrationsResponse = await api.get(ENDPOINTS.MARATHON.REGISTRATIONS).json();
        
        // Process data to get statistics by event type
        const eventTypes = eventTypesResponse.data || [];
        const registrations = registrationsResponse.data || [];
        
        const statistics = eventTypes.map(eventType => {
            // Count registrations for this event type
            const eventRegistrations = registrations.filter(reg => reg.event_id === eventType.id);
            
            // Count completed payments
            const completedPayments = eventRegistrations.filter(
                reg => reg.payment_status === 'completed' || reg.payment_confirmed === true
            ).length;
            
            return {
                id: eventType.id,
                name: eventType.name,
                registered: eventRegistrations.length,
                capacity: eventType.capacity || 300, // Default capacity if not specified
                completedPayments: completedPayments
            };
        });
        
        // Calculate gender distribution
        const maleRegistrations = registrations.filter(reg => reg.gender_id === 1).length;
        const femaleRegistrations = registrations.filter(reg => reg.gender_id === 2).length;
        const totalRegistrations = registrations.length;
        
        const genderDistribution = {
            male: totalRegistrations > 0 ? Math.round((maleRegistrations / totalRegistrations) * 100) : 0,
            female: totalRegistrations > 0 ? Math.round((femaleRegistrations / totalRegistrations) * 100) : 0
        };
        
        return {
            success: true,
            data: {
                events: statistics,
                genderDistribution
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch event statistics'
        };
    }
};
