import { getTokenKey } from '@/api/config';
import { apiClient } from './client';

/**
 * User management API services
 */

/**
 * Get all users (admin only)
 * @returns {Promise<Object>} - Response with users data
 */
export const getUsers = async () => {
  try {
    const response = await apiClient('users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch users'
    };
  }
};

/**
 * Get user by ID (admin only)
 * @param {number} id - User ID
 * @returns {Promise<Object>} - Response with user data
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient(`user/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Get user ${id} error:`, error);
    
    return {
      success: false,
      error: error.message || 'Failed to fetch user details'
    };
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Response with created user data
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient('register', {
      method: 'POST',
      json: userData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      data: response.data,
      message: 'User created successfully'
    };
  } catch (error) {
    console.error('Create user error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to create user',
      errors: error.errors || {}
    };
  }
};

/**
 * Update an existing user (admin only)
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} - Response with updated user data
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await apiClient(`users/${id}`, {
      method: 'PUT',
      json: userData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      data: response.user,
      message: 'User updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update user',
      errors: error.errors || {}
    };
  }
};

/**
 * Delete a user (admin only)
 * @param {number} id - User ID
 * @returns {Promise<Object>} - Response with success message
 */
export const deleteUser = async (id) => {
  try {
    const response = await apiClient(`users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete user'
    };
  }
};

/**
 * Update user status (active/inactive) (admin only)
 * @param {number} id - User ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Response with success message
 */
export const updateUserStatus = async (id, status) => {
  try {
    // Since there's no specific status update endpoint in the API routes,
    // we'll need to check with the backend team if this endpoint exists
    const response = await apiClient(`user/${id}/status`, {
      method: 'PATCH',
      json: { status },
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return {
      success: true,
      message: `User status updated to ${status}`
    };
  } catch (error) {
    console.error(`Update user ${id} status error:`, error);
    
    return {
      success: false,
      error: error.message || 'Failed to update user status'
    };
  }
};
