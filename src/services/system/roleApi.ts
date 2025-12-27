/**
 * 角色管理 API
 * 对应后端 AdminRoleController
 */

import request from '../../utils/request';
import type { RoleType, DataScope, CommonStatus, PageResult } from './types';

const BASE_URL = '/user/admin/role';

// 角色列表查询参数
export interface RoleListParams {
  page?: number;
  size?: number;
  roleType?: RoleType;
  status?: CommonStatus;
  keyword?: string;
}

// 角色详情VO
export interface RoleDetailVO {
  id: number;
  roleCode: string;
  roleName: string;
  roleType: RoleType;
  dataScope: DataScope;
  status: CommonStatus;
  sortOrder?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 角色列表VO
export interface RoleListVO {
  id: number;
  roleCode: string;
  roleName: string;
  roleType: RoleType;
  status: CommonStatus;
  sortOrder?: number;
}

// 角色选项VO
export interface RoleOptionVO {
  id: number;
  roleCode: string;
  roleName: string;
}

// 创建角色请求
export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  roleType?: RoleType;
  dataScope?: DataScope;
  status?: CommonStatus;
  sortOrder?: number;
  description?: string;
}

// 更新角色请求
export interface UpdateRoleRequest {
  roleName?: string;
  roleType?: RoleType;
  dataScope?: DataScope;
  sortOrder?: number;
  description?: string;
}

// 5.1 创建角色
export const createRole = (data: CreateRoleRequest) => {
  return request.post<RoleDetailVO>(BASE_URL, data);
};

// 5.2 获取角色详情
export const getRoleById = (id: number) => {
  return request.get<RoleDetailVO>(`${BASE_URL}/${id}`);
};

// 5.3 更新角色
export const updateRole = (id: number, data: UpdateRoleRequest) => {
  return request.put<RoleDetailVO>(`${BASE_URL}/${id}`, data);
};

// 5.4 删除角色
export const deleteRole = (id: number) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 5.5 分页查询角色列表
export const getRoleList = (params: RoleListParams) => {
  return request.get<PageResult<RoleListVO>>(`${BASE_URL}/list`, { params });
};

// 5.6 修改角色状态
export const updateRoleStatus = (id: number, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

// 5.7 获取角色选项列表
export const getRoleOptions = () => {
  return request.get<RoleOptionVO[]>(`${BASE_URL}/options`);
};

// 5.8 检查角色编码是否存在
export const checkRoleCodeExists = (roleCode: string, excludeId?: number) => {
  return request.get<{ exists: boolean }>(`${BASE_URL}/check-code`, { params: { roleCode, excludeId } });
};

export default {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleList,
  updateRoleStatus,
  getRoleOptions,
  checkRoleCodeExists,
};
