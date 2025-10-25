// Export API client
export { default as apiClient } from './client'
export * from './interceptors'

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },

  // Users
  users: {
    base: '/users',
    profile: '/users/profile',
    changePassword: '/users/change-password',
    uploadAvatar: '/users/avatar',
    bankAccounts: '/users/bank-accounts',
  },

  // Tasks
  tasks: {
    base: '/tasks',
    my: '/tasks/my',
    available: '/tasks/available',
    published: '/tasks/published',
    assigned: '/tasks/assigned',
    completed: '/tasks/completed',
  },

  // Payments
  payments: {
    base: '/payments',
    transactions: '/payments/transactions',
    withdraw: '/payments/withdraw',
    bankAccounts: '/payments/bank-accounts',
  },

  // Chat
  chat: {
    base: '/chat',
    rooms: '/chat/rooms',
    messages: '/chat/messages',
    upload: '/chat/upload',
  },

  // Reports
  reports: {
    base: '/reports',
    generate: '/reports/generate',
    export: '/reports/export',
    analytics: '/reports/analytics',
  },

  // AI Service
  aiService: {
    chat: '/ai-service/chat',
    history: '/ai-service/history',
    rate: '/ai-service/rate',
  },

  // System
  system: {
    health: '/system/health',
    config: '/system/config',
    upload: '/system/upload',
  },
} as const

// API utilities
export const createUrl = (path: string, params?: Record<string, any>): string => {
  const url = new URL(path, import.meta.env.VITE_API_BASE_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    }
  })

  return formData
}