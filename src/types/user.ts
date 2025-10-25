// User management related types

// Import types from auth module
import type {
  User,
  UserStatistics,
  UserRating,
  VerificationLevel,
  UserStatus,
  UserRole,
} from './auth'
import {
  UserStatus as UserStatusEnum,
  UserRole as UserRoleEnum,
  VerificationLevel as VerificationLevelEnum,
} from './auth'

// Re-export for convenience
export type {
  User,
  UserStatistics,
  UserRating,
  BankAccount,
  VerificationLevel,
  UserStatus,
  UserRole,
} from './auth'

// User management specific types
export interface UsersState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
  filters: UserFilters
  pagination: Pagination
}

export interface UserFilters {
  role?: UserRole
  status?: UserStatus
  verificationLevel?: VerificationLevel
  dateRange?: DateRange
  search?: string
  sortBy?: 'createdAt' | 'lastLoginAt' | 'username' | 'successRate'
  sortOrder?: 'asc' | 'desc'
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DateRange {
  start: Date
  end: Date
}

// User profile update types
export interface UpdateUserProfileData {
  username?: string
  email?: string
  phone?: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  address?: string
  bio?: string
}

export interface UpdateUserAvatarData {
  avatar: File
}

export interface AddBankAccountData {
  type: 'wechat' | 'alipay' | 'bank'
  accountNumber: string
  accountName: string
  isDefault?: boolean
}

export interface UpdateBankAccountData {
  id: string
  type?: 'wechat' | 'alipay' | 'bank'
  accountNumber?: string
  accountName?: string
  isDefault?: boolean
}

// User management actions (admin)
export interface CreateUserByAdminData {
  username: string
  email: string
  phone: string
  password: string
  role: UserRole
  gender: 'male' | 'female' | 'other'
  age: number
  address: string
  verificationLevel?: VerificationLevel
}

export interface UpdateUserByAdminData {
  id: string
  status?: UserStatus
  role?: UserRole
  verificationLevel?: VerificationLevel
  statistics?: Partial<UserStatistics>
  rating?: Partial<UserRating>
}

export interface UserListResponse {
  users: User[]
  pagination: Pagination
}

export interface UserDetailResponse {
  user: User
  recentTasks?: Task[]
  recentTransactions?: Transaction[]
}

// User search and filtering
export interface UserSearchQuery {
  query?: string
  role?: UserRole
  status?: UserStatus
  verificationLevel?: VerificationLevel
  createdAfter?: string
  createdBefore?: string
  lastLoginAfter?: string
  lastLoginBefore?: string
  minSuccessRate?: number
  maxSuccessRate?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// User statistics and analytics
export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByRole: Record<UserRole, number>
  usersByStatus: Record<UserStatus, number>
  usersByVerificationLevel: Record<VerificationLevel, number>
  topPerformers: User[]
  recentActivity: UserActivity[]
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

// User validation rules
export interface UserValidationRules {
  username: {
    required: boolean
    minLength: number
    maxLength: number
    pattern?: RegExp
  }
  email: {
    required: boolean
    pattern: RegExp
  }
  phone: {
    required: boolean
    pattern: RegExp
  }
  password: {
    required: boolean
    minLength: number
    pattern?: RegExp
  }
  age: {
    required: boolean
    min: number
    max: number
  }
}

export const defaultUserValidationRules: UserValidationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^1[3-9]\d{9}$/,
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  },
  age: {
    required: true,
    min: 18,
    max: 100,
  },
}

// User utility functions
export const getUserInitials = (user: User): string => {
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase()
  }
  return user.email.substring(0, 2).toUpperCase()
}

export const getUserStatusColor = (status: UserStatus): string => {
  switch (status) {
    case UserStatusEnum.ACTIVE:
      return 'green'
    case UserStatusEnum.INACTIVE:
      return 'orange'
    case UserStatusEnum.SUSPENDED:
      return 'red'
    case UserStatusEnum.PENDING_VERIFICATION:
      return 'blue'
    default:
      return 'gray'
  }
}

export const getUserRoleColor = (role: UserRole): string => {
  switch (role) {
    case UserRoleEnum.ADMIN:
      return 'red'
    case UserRoleEnum.MERCHANT:
      return 'blue'
    case UserRoleEnum.WORKER:
      return 'green'
    default:
      return 'gray'
  }
}

export const getVerificationLevelColor = (level: VerificationLevel): string => {
  switch (level) {
    case VerificationLevelEnum.BASIC:
      return 'gray'
    case VerificationLevelEnum.VERIFIED:
      return 'green'
    case VerificationLevelEnum.PREMIUM:
      return 'blue'
    case VerificationLevelEnum.ENTERPRISE:
      return 'purple'
    default:
      return 'gray'
  }
}

export const formatUserStatistics = (stats: UserStatistics): string => {
  const total = stats.totalTasksTaken
  if (total === 0) return '暂无任务记录'

  const successRate = ((stats.perfectTasksCount + stats.normalTasksCount) / total * 100).toFixed(1)
  return `完成 ${total} 个任务，成功率 ${successRate}%`
}

export const isUserOnline = (user: User): boolean => {
  if (!user.lastLoginAt) return false
  const now = new Date()
  const lastSeen = new Date(user.lastLoginAt)
  const diffInMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
  return diffInMinutes < 5 // Consider online if last seen within 5 minutes
}

// Task and Transaction imports for type dependencies
interface Task {
  id: string
  title: string
  status: string
  [key: string]: any
}

interface Transaction {
  id: string
  amount: number
  type: string
  [key: string]: any
}