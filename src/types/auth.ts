// Authentication related types

export interface User {
  id: string
  username: string
  email: string
  phone: string
  gender: 'male' | 'female' | 'other'
  age: number
  address: string
  avatar?: string
  bio?: string
  verificationLevel: VerificationLevelType
  statistics: UserStatistics
  rating: UserRating
  bankAccounts: BankAccount[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  status: UserStatusType
  role: UserRoleType
}

export interface UserStatistics {
  perfectTasksCount: number
  normalTasksCount: number
  overtimeTasksCount: number
  incompleteTasksCount: number
  totalTasksTaken: number
  totalEarnings: number
  successRate: number
}

export interface UserRating {
  averageRating: number
  totalRatings: number
  ratingDistribution: Record<number, number>
}

export interface BankAccount {
  id: string
  type: 'wechat' | 'alipay' | 'bank'
  accountNumber: string
  accountName: string
  isDefault: boolean
  isVerified: boolean
}

export const VerificationLevel = {
  BASIC: 'basic',
  VERIFIED: 'verified',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
} as const

export type VerificationLevelType = typeof VerificationLevel[keyof typeof VerificationLevel]

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_VERIFICATION: 'pending_verification'
} as const

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus]

export const UserRole = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  WORKER: 'worker'
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  conditions?: Record<string, any>
}

// Login/Register forms
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  gender: 'male' | 'female' | 'other'
  age: number
  address: string
  agreement: boolean
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Authentication responses
export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}

// JWT Token payload
export interface JwtPayload {
  sub: string
  username: string
  role: UserRoleType
  iat: number
  exp: number
  iss: string
  aud: string
}

// Authentication errors
export interface AuthError {
  code: string
  message: string
  field?: string
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRoleType, string[]> = {
  [UserRole.ADMIN]: [
    'users:read', 'users:write', 'users:delete',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'payments:read', 'payments:write', 'payments:delete',
    'chat:read', 'chat:write', 'chat:delete',
    'reports:read', 'reports:write', 'reports:delete',
    'system:read', 'system:write', 'system:delete',
    'ai_service:read', 'ai_service:write', 'ai_service:delete',
  ],
  [UserRole.MERCHANT]: [
    'tasks:read', 'tasks:write',
    'payments:read', 'payments:write',
    'chat:read', 'chat:write',
    'reports:read',
    'ai_service:read', 'ai_service:write',
  ],
  [UserRole.WORKER]: [
    'tasks:read',
    'payments:read',
    'chat:read', 'chat:write',
    'reports:read:own',
    'ai_service:read', 'ai_service:write',
  ],
}

// Utility functions
export const hasPermission = (userRole: UserRoleType, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export const canAccessResource = (
  user: User | null,
  resource: string,
  action: string
): boolean => {
  if (!user) return false

  const permission = `${resource}:${action}`
  return hasPermission(user.role, permission)
}

export const getDisplayName = (user: User): string => {
  return user.username || user.email || 'Unknown User'
}

export const isUserVerified = (user: User): boolean => {
  return user.verificationLevel !== VerificationLevel.BASIC
}

export const isUserActive = (user: User): boolean => {
  return user.status === UserStatus.ACTIVE
}

export const getUserAvatar = (user: User): string => {
  return user.avatar || '/default-avatar.png'
}