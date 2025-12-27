/**
 * 用户管理 API
 * 对应后端 AdminUserController
 */

import request from '../../utils/request';
import type { UserStatus, Gender, PageResult } from './types';

const BASE_URL = '/user/admin';

// 用户列表查询参数
export interface UserListParams {
  page?: number;
  size?: number;
  username?: string;
  status?: UserStatus;
  gender?: Gender;
  startTime?: string;
  endTime?: string;
}

// 用户详情VO
export interface AdminUserDetailVO {
  id: number;
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  roles?: RoleVO[];
}

// 用户列表VO
export interface AdminUserListVO {
  id: number;
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

// 角色VO
export interface RoleVO {
  id: number;
  roleName: string;
  roleCode: string;
}

// 创建用户请求
export interface CreateUserRequest {
  username: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: UserStatus;
  userAuthList: UserAuthItem[];
  roles?: number[];
  createdAt: string;
  updatedAt: string;
}

// 用户认证信息
export interface UserAuthItem {
  identityType: string;
  identifier: string;
  credential: string;
}

// 更新用户请求
export interface UpdateUserRequest {
  username?: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: UserStatus;
  roles?: number[];
}

// 1.1 根据ID查询用户
export const getUserById = (id: number) => {
  return request.get<AdminUserDetailVO>(`${BASE_URL}/${id}`);
};

// 1.2 创建用户
export const createUser = (data: CreateUserRequest) => {
  return request.post<AdminUserListVO>(BASE_URL, data);
};

// 1.3 分页查询用户列表
export const getUserList = (params: UserListParams) => {
  return request.get<PageResult<AdminUserListVO>>(`${BASE_URL}/list`, { params });
};

// 1.4 更新用户信息
export const updateUser = (id: number, data: UpdateUserRequest) => {
  return request.put<AdminUserListVO>(`${BASE_URL}/${id}`, data);
};

// 1.5 删除用户
export const deleteUser = (id: number, password: string) => {
  return request.post(`${BASE_URL}/${id}`, { password });
};

// 1.6 获取用户状态
export const getUserStatus = (username: string) => {
  return request.get(`${BASE_URL}/status`, { params: { username } });
};

// 1.7 重置用户密码
export const resetUserPassword = (id: number, password: string) => {
  return request.put(`${BASE_URL}/resetPassword/${id}`, { password });
};

// 1.8 更新用户状态
export const updateUserStatus = (id: number, status: UserStatus) => {
  return request.put(`${BASE_URL}/status`, { id, status });
};

// 1.9 批量删除用户
export const batchDeleteUsers = (ids: number[], password: string) => {
  return request.post(`${BASE_URL}/batch/delete`, { password }, { params: { ids: ids.join(',') } });
};

// 1.10 批量更新用户状态
export const batchUpdateUserStatus = (userIds: number[], status: UserStatus) => {
  return request.put(`${BASE_URL}/batch/status`, { userIds, status });
};

export default {
  getUserById,
  createUser,
  getUserList,
  updateUser,
  deleteUser,
  getUserStatus,
  resetUserPassword,
  updateUserStatus,
  batchDeleteUsers,
  batchUpdateUserStatus,
};
