/**
 * 用户管理 API
 * 对应后端 AdminUserController
 * baseUrl: /api/user
 */

import request from '../../utils/request';
import type { UserStatus, Gender, PageResult, RoleType, DataScope } from './types';

const BASE_URL = '/user/admin';

// 用户列表查询参数
export interface UserListParams {
  page?: number;
  size?: number;
  username?: string;
  status?: string;
  gender?: number;
  startTime?: string;
  endTime?: string;
}

// 用户认证类型
export const UserAuthType = {
  WECHAT: 0,
  QQ: 1,
  ALIPAY: 2,
  WEIBO: 3,
  USERNAME: 4,
  PHONE: 5,
  EMAIL: 6,
} as const;
export type UserAuthType = typeof UserAuthType[keyof typeof UserAuthType];

// 用户认证信息请求
export interface UserAuthRequest {
  userId?: string;
  identificationType: UserAuthType;
  identification: string;
  password: string;
  expiresIn?: string;
}

// 用户角色请求
export interface UserRoleRequest {
  roleId: string;
  roleName?: string;
}

// 用户详情角色VO
export interface AdminUserDetailRoleVO {
  id: string;
  roleCode: string;
  roleName: string;
  roleType?: RoleType;
  dataScope?: DataScope;
}

// 用户列表角色VO
export interface AdminUserRoleVO {
  roleId: string;
  roleName: string;
}

// 用户详情VO
export interface AdminUserDetailVO {
  id: string;
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  roles?: AdminUserDetailRoleVO[];
}

// 用户列表VO
export interface AdminUserListVO {
  id: string;
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  roles?: AdminUserRoleVO[];
}

// 创建用户请求
export interface CreateUserRequest {
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: UserStatus;
  userAuthList: UserAuthRequest[];
  roles?: UserRoleRequest[];
  createdAt: string;
  updatedAt: string;
}

// 更新用户请求
export interface UpdateUserRequest {
  id?: string;
  username?: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: AdminUserRoleVO[];
}

// 更新用户响应VO
export interface AdminUserUpdateVO {
  id: string;
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  roles?: AdminUserRoleVO[];
}

// 用户状态VO
export interface UserStatusVO {
  status: UserStatus;
}

// 密码请求
export interface PasswordRequest {
  password: string;
}

// 重置密码请求参数
export interface ResetPasswordRequest {
  adminPassword: string;
  newPassword: string;
}

// 更新状态请求
export interface UpdateStatusRequest {
  id: string;
  status: UserStatus;
}

// 批量更新状态请求
export interface BatchUpdateStatusRequest {
  userIds: string[];
  status: UserStatus;
}

// 1. 根据ID查询用户
export const getUserById = (id: string) => {
  return request.get<AdminUserDetailVO>(`${BASE_URL}/${id}`);
};

// 2. 创建用户
export const createUser = (data: CreateUserRequest) => {
  return request.post<AdminUserListVO>(BASE_URL, data);
};

// 3. 分页查询用户列表
export const getUserList = (params: UserListParams) => {
  return request.get<PageResult<AdminUserListVO>>(`${BASE_URL}/list`, { params });
};

// 4. 更新用户信息
export const updateUser = (id: string, data: UpdateUserRequest) => {
  return request.put<AdminUserUpdateVO>(`${BASE_URL}/${id}`, data);
};

// 5. 检查密码
export const checkPassword = (password: string) => {
  return request.post<boolean>(`${BASE_URL}/check/password`, { password });
};

// 6. 删除用户
export const deleteUser = (id: string, password: string) => {
  return request.post<void>(`${BASE_URL}/${id}`, { password });
};

// 7. 获取用户状态
export const getUserStatus = (username: string) => {
  return request.get<UserStatusVO>(`${BASE_URL}/status`, { params: { username } });
};

// 8. 重置用户密码
export const resetUserPassword = (id: string, data: ResetPasswordRequest) => {
  return request.put<void>(`${BASE_URL}/resetPassword/${id}`, data);
};

// 9. 更新用户状态
export const updateUserStatus = (data: UpdateStatusRequest) => {
  return request.put<void>(`${BASE_URL}/status`, data);
};

// 10. 批量删除用户
export const batchDeleteUsers = (ids: string[], password: string) => {
  return request.post<void>(`${BASE_URL}/batch/delete`, { password }, { params: { ids } });
};

// 11. 批量更新用户状态
export const batchUpdateUserStatus = (data: BatchUpdateStatusRequest) => {
  return request.put<void>(`${BASE_URL}/batch/status`, data);
};

export default {
  getUserById,
  createUser,
  getUserList,
  updateUser,
  checkPassword,
  deleteUser,
  getUserStatus,
  resetUserPassword,
  updateUserStatus,
  batchDeleteUsers,
  batchUpdateUserStatus,
};
