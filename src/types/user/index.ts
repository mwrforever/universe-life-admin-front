/**
 * Universe Life Admin - 用户管理类型定义
 *
 * 完整的用户数据类型系统，支持复杂的企业级用户管理功能
 *
 * @author James
 * @version 1.0.0
 */

import React from 'react';

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  BANNED = 'banned',
}

// 用户角色枚举
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  USER = 'user',
}

// 认证状态枚举
export enum AuthStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending_verification',
  REJECTED = 'rejected',
}

// 用户性别枚举
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}

// 基础用户信息接口
export interface User {
  // 基础信息
  id: string;
  username: string;
  email: string;
  phone: string;
  realName?: string;
  nickname?: string;
  avatar?: string;

  // 状态信息
  status: UserStatus;
  role: UserRole;
  authStatus: AuthStatus;

  // 个人信息
  gender?: Gender;
  birthday?: string;
  bio?: string;
  location?: string;
  website?: string;

  // 系统信息
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIP?: string;
  registrationIP?: string;

  // 统计信息
  loginCount: number;
  postCount: number;
  followerCount: number;
  followingCount: number;

  // 验证信息
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;

  // 安全设置
  twoFactorEnabled: boolean;
  loginNotifications: boolean;

  // 偏好设置
  language: string;
  timezone: string;

  // 标签和备注
  tags?: string[];
  internalNotes?: string;

  // 风险标记
  riskLevel: 'low' | 'medium' | 'high';
  suspiciousActivity: boolean;
}

// 用户查询参数接口
export interface UserQueryParams {
  current?: number;
  pageSize?: number;

  // 基础筛选
  keyword?: string;
  status?: UserStatus | UserStatus[];
  role?: UserRole | UserRole[];
  authStatus?: AuthStatus | AuthStatus[];
  gender?: Gender | Gender[];
  riskLevel?: ('low' | 'medium' | 'high')[];

  // 时间筛选
  createdAtStart?: string;
  createdAtEnd?: string;
  lastLoginAtStart?: string;
  lastLoginAtEnd?: string;

  // 验证状态筛选
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;

  // 安全设置筛选
  twoFactorEnabled?: boolean;
  suspiciousActivity?: boolean;

  // 排序
  sortField?: string;
  sortOrder?: 'asc' | 'desc';

  // 标签筛选
  tags?: string[];
}

// 用户列表响应接口
export interface UserListResponse {
  data: User[];
  success: boolean;
  total: number;
  current: number;
  pageSize: number;
}

// ProTable列配置类型
export type UserTableColumnType = {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  filters?: { text: string; value: string }[];
  render?: (_value: unknown, _record: User, _index: number) => React.ReactNode;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  order?: number;
};

// 用户操作日志接口
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  ip: string;
  userAgent?: string;
  location?: string;
  status: 'success' | 'failed' | 'warning';
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// 用户统计信息接口
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  highRiskUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  loginTrend: Array<{
    date: string;
    count: number;
  }>;
}

// 批量操作参数接口
export interface BatchOperationParams {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'ban' | 'delete' | 'assign_role' | 'add_tags' | 'remove_tags';
  params?: {
    role?: UserRole;
    tags?: string[];
    reason?: string;
  };
}

// 用户表单数据接口（用于创建/编辑）
export interface UserFormData {
  username: string;
  email: string;
  phone: string;
  realName?: string;
  nickname?: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  gender?: Gender;
  birthday?: string;
  bio?: string;
  location?: string;
  website?: string;
  language: string;
  timezone: string;
  tags?: string[];
  internalNotes?: string;
  twoFactorEnabled?: boolean;
  loginNotifications?: boolean;
}

// 导出数据接口
export interface UserExportParams {
  format: 'excel' | 'csv' | 'json';
  fields: string[];
  filters?: Partial<UserQueryParams>;
}

// 导入数据接口
export interface UserImportParams {
  file: File;
  format: 'excel' | 'csv' | 'json';
  options: {
    skipHeaders?: boolean;
    updateExisting?: boolean;
    sendWelcomeEmail?: boolean;
  };
}

// 用户详情扩展接口
export interface UserDetail extends User {
  profileCompletion: number;
  devices: Array<{
    id: string;
    type: string;
    name: string;
    lastUsed: string;
    trusted: boolean;
  }>;
  sessions: Array<{
    id: string;
    ip: string;
    location?: string;
    userAgent?: string;
    createdAt: string;
    expiresAt: string;
  }>;
  permissions: string[];
  groups: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  auditLogs: UserActivityLog[];
}