import { getTokenKey } from '@/api/config';
import ky from 'ky';
import { API_BASE_URL, DEFAULT_HEADERS, getApiBaseUrl } from './config';

class ApiError extends Error {
    constructor(message, status, errors = null) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.name = 'ApiError';
    }
}

// Create a ky instance with default configuration
export const api = ky.create({
    prefixUrl: API_BASE_URL,
    headers: DEFAULT_HEADERS,
    hooks: {
        beforeRequest: [
            async request => {
                // Add authentication token to all requests
                const token = localStorage.getItem(getTokenKey());
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }

                // Send Swahili pages to the Swahili API
                const base = getApiBaseUrl();
                if (base !== API_BASE_URL && request.url.startsWith(API_BASE_URL)) {
                    const hasBody = !['GET', 'HEAD'].includes(request.method);
                    return new Request(base + request.url.slice(API_BASE_URL.length), {
                        method: request.method,
                        headers: request.headers,
                        body: hasBody ? await request.clone().arrayBuffer() : undefined,
                        signal: request.signal,
                    });
                }
            }
        ],
        beforeError: [
            async (error) => {
                const { response } = error;
                if (response && response.body) {
                    try {
                        const data = await response.json();
                        error.message = data.message || error.message;
                        error.errors = data.errors;
                        error.retryAfter = data.retryAfter;
                        error.status = response.status;
                    } catch (_) {
                        // If JSON parsing fails, use the original error
                        error.status = response.status;
                    }
                }
                return error;
            }
        ]
    },
    retry: {
        limit: 0, // Disable retries for rate-limited endpoints
    },
    timeout: 10000 // Default 10 second timeout for all requests
});

// Create a special instance for marathon banner with longer timeout
export const marathonBannerApi = api.extend({
    timeout: 20000, // 20 second timeout
    retry: {
        limit: 3,
        methods: ['get']
    }
});

export const apiClient = async (endpoint, options = {}) => {
    try {
        // In development mode, log the API request
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${endpoint}`, options);
        }
        
        // Create a custom ky instance with the provided options
        const customApi = api.extend(options);
        
        const response = await customApi(endpoint);

        if (!response.ok) {
            throw new ApiError(
                response.message || 'An error occurred',
                response.status,
                response.errors
            );
        }

        const data = await response.json();
        
        // In development mode, log the API response
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${endpoint}`, data);
        }
        
        return data;
    } catch (error) {
        // In development mode, log the API error
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error: ${endpoint}`, error);
        }
        
        if (error instanceof ApiError) {
            throw error;
        }
        
        // Handle timeout errors specifically
        if (error.name === 'TimeoutError') {
            throw new ApiError(
                'Request timed out',
                408,
                { general: ['The server took too long to respond. Please try again later.'] }
            );
        }
        
        // Handle specific HTTP status codes
        if (error.response) {
            const status = error.status || error.response.status;
            let message = 'An error occurred';
            let errors = null;
            
            // Handle specific status codes
            if (status === 401) {
                message = 'Invalid credentials';
                errors = { general: ['Invalid email or password'] };
            } else if (status === 403) {
                message = 'Access denied';
                errors = { general: ['You do not have permission to access this resource'] };
            } else if (status === 404) {
                message = 'Resource not found';
            } else if (status === 422) {
                message = 'Validation failed';
                try {
                    const data = await error.response.json();
                    errors = data.errors || { general: ['Validation failed'] };
                } catch (_) {
                    errors = { general: ['Validation failed'] };
                }
            } else if (status >= 500) {
                message = 'Server error';
                errors = { general: ['A server error occurred. Please try again later.'] };
            }
            
            throw new ApiError(message, status, errors);
        }
        
        // Check if this is a CORS error (which typically appears as a TypeError with a message about fetch)
        if (error instanceof TypeError && 
            (error.message.includes('Failed to fetch') || 
             error.message.includes('Network request failed'))) {
            console.warn('Possible CORS error detected. Check that your API server has CORS enabled.');
            
            throw new ApiError(
                'CORS error: API server may not allow cross-origin requests',
                0,
                { 
                    general: [
                        'Cannot connect to the API due to CORS restrictions.',
                        'Make sure your API server has CORS enabled for this origin.'
                    ] 
                }
            );
        }
        
        throw new ApiError(
            'Network error or server is unreachable',
            500,
            { general: ['Cannot connect to the server. Please check your internet connection.'] }
        );
    }
};
