import { getTokenKey } from '@/api/config';
import { api } from '../client';
import { ENDPOINTS } from '../config';

export const registerParticipant = async (registrationData) => {
    try {
        // Transform frontend data to match backend expectations
        const transformedData = {
            first_name: registrationData.firstName,
            last_name: registrationData.lastName,
            email: registrationData.email,
            phone_number: registrationData.phoneNumber,
            event_id: registrationData.event_id,
            shirt_size_id: registrationData.shirt_size_id,
            kids_shirt_size_id: registrationData.kids_shirt_size_id,
            collection_venue_id: registrationData.collection_venue_id,
            nationality_id: registrationData.nationality_id,
            id_number: registrationData.idNumber,
            passport_number: registrationData.passportNumber,
            date_of_birth: registrationData.dateOfBirth,
            gender_id: registrationData.gender_id,
            country_id: registrationData.country_id,
            emergency_contact_name: registrationData.emergencyContactName,
            emergency_contact_number: registrationData.emergencyContactNumber,
            postal_code: registrationData.postalCode,
            voucher_code: registrationData.voucherCode
        };

        const response = await api.post(ENDPOINTS.MARATHON.REGISTER, {
            json: transformedData,
            timeout: 60000 // Increase timeout to 60 seconds
        }).json();

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Handle rate limiting error specifically
        if (error.response?.status === 429) {
            return {
                success: false,
                error: error.message,
                retryAfter: error.retryAfter
            };
        }

        // Handle validation errors
        if (error.response?.status === 422) {
            // Extract validation errors from the response
            const validationErrors = error.response?.data?.errors || {};
            
            return {
                success: false,
                error: 'Validation failed',
                validationErrors: validationErrors
            };
        }

        // Handle other errors
        return {
            success: false,
            error: error.message || 'An error occurred during registration'
        };
    }
};

export const getAllRegistrations = async () => {
    try {
        const response = await api.get(ENDPOINTS.MARATHON.REGISTRATIONS).json();
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch registrations'
        };
    }
};

export const confirmPayment = async (registrationId, notes = '') => {
    try {
        const response = await api.post(`registrations/${registrationId}/confirm-payment`, {
            json: { notes },
            headers: {
                Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
            }
        }).json();
        
        return {
            success: true,
            data: response.data,
            message: response.message || 'Payment confirmed successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to confirm payment'
        };
    }
};

export const getConfirmedPayments = async () => {
    try {
        const response = await api.get(ENDPOINTS.REGISTRATIONS.CONFIRMED_PAYMENTS, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
            }
        }).json();
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to fetch confirmed payments'
        };
    }
};
