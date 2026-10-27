// Until Phase 5 the site still talks to the two Laravel APIs: English pages
// use api.mwafem.com, Swahili pages (/sw/...) use api-sw.mwafem.com.
const API_BASE_URLS = {
    en: 'https://api.mwafem.com/api',
    sw: 'https://api-sw.mwafem.com/api',
};

const currentLocale = () =>
    typeof document !== 'undefined' && document.documentElement.lang === 'sw' ? 'sw' : 'en';

export const API_BASE_URL = API_BASE_URLS.en;

export const getApiBaseUrl = () => API_BASE_URLS[currentLocale()];

// Each API has its own users, so keep their login tokens apart.
export const getTokenKey = () => (currentLocale() === 'sw' ? 'auth_token_sw' : 'auth_token');

export const ENDPOINTS = {
    MARATHON: {
        REGISTER: 'marathon/register',
        REGISTRATIONS: 'marathon/registrations',
        CONFIRM_PAYMENT: 'registrations/confirm-payment',
        BANNERS: {
            ACTIVE: 'marathon-banner/active',
            ADMIN: {
                BASE: 'admin/marathon-banners',
                DETAIL: (id) => `admin/marathon-banners/${id}`,
                // The Swahili API names this route toggle-active
                TOGGLE: (id) => `admin/marathon-banners/${id}/${currentLocale() === 'sw' ? 'toggle-active' : 'toggle'}`,
                EVENTS: 'admin/marathon-banners/events'
            }
        }
    },
    REGISTRATIONS: {
        BASE: 'registrations',
        CONFIRMED_PAYMENTS: 'registrations/confirmed-payments'
    },
    DROPDOWNS: {
        EVENTS: 'dropdowns/events',
        SHIRT_SIZES: 'dropdowns/shirt-sizes',
        COLLECTION_VENUES: 'dropdowns/collection-venues',
        COUNTRIES: 'dropdowns/countries',
        GENDERS: 'dropdowns/genders'
    },
    EVENT_DATA: {
        EVENT_TYPES: 'event-data/event-types',
        SCHEDULE: 'event-data/schedule'
    }
};

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
