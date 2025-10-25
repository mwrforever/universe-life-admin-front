// Redux store types that are used across the application
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface EntityState<T> {
  data: T[]
  current: T | null
  loading: boolean
  error: string | null
  pagination: PaginationState
}

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface ResponseMeta {
  pagination?: PaginationMeta
  timestamp: string
  requestId: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Socket state types
export interface SocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  rooms: string[]
  messages: Record<string, any[]>
  onlineUsers: Record<string, boolean>
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    url?: string
    handler?: () => void
  }
}

// UI state types
export interface UIState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  loading: Record<string, boolean>
  modals: Record<string, boolean>
  breadcrumbs: Breadcrumb[]
}

export interface Breadcrumb {
  title: string
  path?: string
  icon?: string
}