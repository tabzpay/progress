/**
 * Application Constants
 * Centralized configuration and constant values
 */

// ============================================================================
// PAYMENT TERMS
// ============================================================================

export const PAYMENT_TERMS = {
    DUE_ON_RECEIPT: 'Due on Receipt',
    NET_7: 'Net 7',
    NET_15: 'Net 15',
    NET_30: 'Net 30',
    NET_60: 'Net 60',
    NET_90: 'Net 90',
} as const;

export type PaymentTermValue = typeof PAYMENT_TERMS[keyof typeof PAYMENT_TERMS];

// ============================================================================
// LOAN STATUS
// ============================================================================

export const LOAN_STATUS = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    PAID: 'PAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED',
    DEFAULTED: 'DEFAULTED',
} as const;

export type LoanStatus = typeof LOAN_STATUS[keyof typeof LOAN_STATUS];

// Status display configuration
export const LOAN_STATUS_CONFIG = {
    [LOAN_STATUS.PENDING]: {
        label: 'Pending',
        color: 'blue',
        description: 'Awaiting approval',
    },
    [LOAN_STATUS.ACTIVE]: {
        label: 'Active',
        color: 'green',
        description: 'Currently active',
    },
    [LOAN_STATUS.PAID]: {
        label: 'Paid',
        color: 'emerald',
        description: 'Fully repaid',
    },
    [LOAN_STATUS.OVERDUE]: {
        label: 'Overdue',
        color: 'orange',
        description: 'Payment overdue',
    },
    [LOAN_STATUS.CANCELLED]: {
        label: 'Cancelled',
        color: 'gray',
        description: 'Loan cancelled',
    },
    [LOAN_STATUS.DEFAULTED]: {
        label: 'Defaulted',
        color: 'red',
        description: 'Loan defaulted',
    },
} as const;

// ============================================================================
// LOAN TYPES
// ============================================================================

export const LOAN_TYPE = {
    PERSONAL: 'personal',
    BUSINESS: 'business',
    GROUP: 'group',
} as const;

export type LoanType = typeof LOAN_TYPE[keyof typeof LOAN_TYPE];

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export const CUSTOMER_TYPE = {
    INDIVIDUAL: 'individual',
    COMPANY: 'company',
} as const;

export type CustomerType = typeof CUSTOMER_TYPE[keyof typeof CUSTOMER_TYPE];

// ============================================================================
// CURRENCIES
// ============================================================================

export const CURRENCY = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP',
    NGN: 'NGN',
    GHS: 'GHS',
    KES: 'KES',
    ZAR: 'ZAR',
} as const;

export type CurrencyCode = typeof CURRENCY[keyof typeof CURRENCY];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    GHS: '₵',
    KES: 'KSh',
    ZAR: 'R',
};

// ============================================================================
// ROUTES
// ============================================================================

export const ROUTES = {
    HOME: '/',
    LANDING: '/landing',

    // Auth
    SIGN_IN: '/sign-in',
    SIGN_UP: '/register',
    FORGOT_PASSWORD: '/forgot-password',

    // Main App
    DASHBOARD: '/dashboard',

    // Loans
    LOANS: '/loans',
    CREATE_LOAN: '/create-loan',
    LOAN_DETAIL: (id: string) => `/loan/${id}`,
    ADD_PAYMENT: (id: string) => `/loan/${id}/add-payment`,

    // Customers
    CUSTOMERS: '/customers',
    CUSTOMER_DETAIL: (id: string) => `/customers/${id}`,
    CREATE_CUSTOMER: '/customers/new',

    // Groups
    GROUPS: '/groups',
    GROUP_DETAIL: (id: string) => `/groups/${id}`,
    CREATE_GROUP: '/groups/new',

    // Analytics
    ANALYTICS: '/analytics',
    CREDIT_HEALTH: '/credit-health',

    // Settings
    PROFILE: '/profile',
    EDIT_PROFILE: '/profile/edit',
    SECURITY_SETTINGS: '/security',
    REMINDER_SETTINGS: '/reminder-settings',

    // Utilities
    MORE: '/more',
    SEND_NOTICE: '/send-notice',
    ACTIVITY_LOG: '/activity-log',
    HELP_CENTER: '/help',

    // Marketing
    FEATURES: '/features',
    PRICING: '/pricing',
    STORIES: '/stories',
    ABOUT: '/about',
    CONTACT: '/contact',
    BLOG: '/blog',
    PRIVACY: '/privacy',
    TERMS: '/terms',
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const LIMITS = {
    // Loan
    MIN_LOAN_AMOUNT: 1,
    MAX_LOAN_AMOUNT: 1000000000, // 1 billion

    // Customer
    MAX_CUSTOMER_NAME_LENGTH: 100,
    MAX_COMPANY_NAME_LENGTH: 200,
    MAX_EMAIL_LENGTH: 255,
    MAX_PHONE_LENGTH: 20,

    // Group
    MIN_GROUP_MEMBERS: 2,
    MAX_GROUP_MEMBERS: 100,
    MAX_GROUP_NAME_LENGTH: 100,

    // Notes/Description
    MAX_NOTE_LENGTH: 5000,
    MAX_DESCRIPTION_LENGTH: 1000,

    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

// ============================================================================
// TIME DURATIONS
// ============================================================================

export const DURATION = {
    TOAST_DEFAULT: 4000,
    TOAST_SHORT: 2000,
    TOAST_LONG: 6000,

    DEBOUNCE_SEARCH: 300,
    DEBOUNCE_AUTOSAVE: 1000,

    CACHE_STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CACHE_GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
    THEME: 'theme',
    SIDEBAR_STATE: 'sidebar_open',
    DRAFT_PREFIX: 'loan_draft_',
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
} as const;

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // ms
    REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

// ============================================================================
// CREDIT UTILIZATION THRESHOLDS
// ============================================================================

export const CREDIT_THRESHOLD = {
    HEALTHY: 60,
    WARNING: 80,
    CRITICAL: 90,
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMAT = {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_LONG: 'MMMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    INPUT: 'yyyy-MM-dd',
    API: 'yyyy-MM-dd\'T\'HH:mm:ss',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\d\s\-\+\(\)]+$/,
    ACCOUNT_NUMBER: /^[0-9]{10,17}$/,
    ROUTING_NUMBER: /^[0-9]{9}$/,
    TAX_ID: /^[A-Z0-9\-]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// ============================================================================
// FEATURE FLAGS (for gradual rollout)
// ============================================================================

export const FEATURES = {
    ENABLE_ANALYTICS: true,
    ENABLE_GROUPS: true,
    ENABLE_CUSTOMERS: true,
    ENABLE_PAYMENT_PLANS: true,
    ENABLE_INVOICES: false, // Coming soon
    ENABLE_PRODUCT_CATALOG: false, // Coming soon
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODE = {
    // Generic
    UNKNOWN: 'UNKNOWN',
    NETWORK_ERROR: 'NETWORK_ERROR',

    // Authentication
    UNAUTHORIZED: 'UNAUTHORIZED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Database
    DUPLICATE_ENTRY: '23505',
    FOREIGN_KEY_VIOLATION: '23503',
    NOT_NULL_VIOLATION: '23502',

    // Permission
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INSUFFICIENT_PRIVILEGES: '42501',

    // Business Logic
    CREDIT_LIMIT_EXCEEDED: 'CREDIT_LIMIT_EXCEEDED',
    INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: '429',
} as const;

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const ANALYTICS_EVENT = {
    // Loan Events
    LOAN_CREATED: 'loan_created',
    LOAN_UPDATED: 'loan_updated',
    LOAN_DELETED: 'loan_deleted',
    PAYMENT_ADDED: 'payment_added',

    // Customer Events
    CUSTOMER_CREATED: 'customer_created',
    CUSTOMER_UPDATED: 'customer_updated',

    // Group Events
    GROUP_CREATED: 'group_created',
    GROUP_JOINED: 'group_joined',

    // User Events
    USER_SIGNED_UP: 'user_signed_up',
    USER_SIGNED_IN: 'user_signed_in',
    USER_SIGNED_OUT: 'user_signed_out',
} as const;
