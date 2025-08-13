export const APP_NAME = 'Interswitch Banking Dashboard';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    SESSION: '/api/auth/session',
  },
  ACCOUNTS: {
    LIST: '/api/accounts',
    DETAILS: '/api/accounts/:id',
    TRANSACTIONS: '/api/accounts/:id/transactions',
  },
  TRANSFERS: {
    INITIATE: '/api/transfers',
    STATUS: '/api/transfers/:id/status',
  },
} as const;

export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 5,
  WARNING_MINUTES: 1,
  REFRESH_INTERVAL_MS: 60000,
} as const;

export const VALIDATION_RULES = {
  ACCOUNT_NUMBER: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
    PATTERN: /^\d+$/,
  },
  PIN: {
    LENGTH: 4,
    PATTERN: /^\d+$/,
  },
  TRANSFER: {
    MAX_AMOUNT: 1000000,
    MIN_AMOUNT: 1,
    DESCRIPTION_MAX_LENGTH: 140,
  },
} as const;

export const UI_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: "Access denied. You don't have permission to view this resource.",
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  LOGOUT: 'Successfully logged out.',
  TRANSFER: 'Transfer initiated successfully.',
  UPDATE: 'Updated successfully.',
  DELETE: 'Deleted successfully.',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
