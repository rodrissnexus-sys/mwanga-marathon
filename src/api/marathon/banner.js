import { apiClient, marathonBannerApi } from '../client';
import { ENDPOINTS } from '../config';

/**
 * Get the active marathon banner if available
 * @returns {Promise} API response with banner data or status: 'closed'
 */
export const getActiveBanner = async () => {
  try {
    const response = await marathonBannerApi.get(ENDPOINTS.MARATHON.BANNERS.ACTIVE).json();
    return response;
  } catch (error) {
    console.error('Error fetching active marathon banner:', error);
    return {
      status: 'closed',
      message: 'No active marathon registration available'
    };
  }
};

/**
 * Admin functions for managing marathon banners
 */

/**
 * Get all marathon banners (admin only)
 * @returns {Promise} API response with all banners
 */
export const getAllBanners = async () => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.BASE, {
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error('Error fetching all marathon banners:', error);
    throw error;
  }
};

/**
 * Get a specific marathon banner by ID (admin only)
 * @param {number} id - Banner ID
 * @returns {Promise} API response with banner data
 */
export const getBannerById = async (id) => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.DETAIL(id), {
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error(`Error fetching marathon banner with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new marathon banner (admin only)
 * @param {Object} bannerData - Banner data
 * @returns {Promise} API response with created banner
 */
export const createBanner = async (bannerData) => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.BASE, {
      method: 'POST',
      json: bannerData,
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error('Error creating marathon banner:', error);
    throw error;
  }
};

/**
 * Update an existing marathon banner (admin only)
 * @param {number} id - Banner ID
 * @param {Object} bannerData - Updated banner data
 * @returns {Promise} API response with updated banner
 */
export const updateBanner = async (id, bannerData) => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.DETAIL(id), {
      method: 'PUT',
      json: bannerData,
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error(`Error updating marathon banner with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a marathon banner (admin only)
 * @param {number} id - Banner ID
 * @returns {Promise} API response
 */
export const deleteBanner = async (id) => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.DETAIL(id), {
      method: 'DELETE',
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error(`Error deleting marathon banner with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle the active status of a marathon banner (admin only)
 * @param {number} id - Banner ID
 * @returns {Promise} API response
 */
export const toggleBannerActive = async (id) => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.TOGGLE(id), {
      method: 'PATCH',
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error(`Error toggling active status for marathon banner with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get available events for banner selection (admin only)
 * @returns {Promise} API response with available events
 */
export const getAvailableEvents = async () => {
  try {
    const response = await apiClient(ENDPOINTS.MARATHON.BANNERS.ADMIN.EVENTS, {
      requiresAuth: true
    });
    return response;
  } catch (error) {
    console.error('Error fetching available events:', error);
    throw error;
  }
};
