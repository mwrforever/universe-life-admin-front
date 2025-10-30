// Application constants
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || '万象生活管理端',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'ws://localhost:5001',
} as const

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
  },
  TASKS: {
    BASE: '/tasks',
  },
} as const

// Roles
export const ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  WORKER: 'worker',
} as const

// Status
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const