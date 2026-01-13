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
  id: string;
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
  id: string;
  roleCode: string;
  roleName: string;
  roleType: RoleType;
  dataScope: DataScope;
  status: CommonStatus;
  createdAt: string;
}

// 角色选项VO
export interface RoleOptionVO {
  id: string;
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
  dataScope?: DataScope;
  sortOrder?: number;
  description?: string;
}

// 5.1 创建角色
export const createRole = (data: CreateRoleRequest) => {
  return request.post<void>(BASE_URL, data);
};

// 5.2 获取角色详情
export const getRoleById = (id: string) => {
  return request.get<RoleDetailVO>(`${BASE_URL}/${id}`);
};

// 5.3 更新角色
export const updateRole = (id: string, data: UpdateRoleRequest) => {
  return request.put<void>(`${BASE_URL}/${id}`, data);
};

// 5.4 删除角色
export const deleteRole = (id: string) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 5.5 分页查询角色列表
export const getRoleList = (params: RoleListParams) => {
  return request.get<PageResult<RoleListVO>>(`${BASE_URL}/list`, { params });
};

// 5.6 修改角色状态
export const updateRoleStatus = (id: string, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

// 5.7 获取角色选项列表
export const getRoleOptions = () => {
  return request.get<RoleOptionVO[]>(`${BASE_URL}/options`);
};

// 5.8 获取角色的资源权限
export const getRoleResources = (id: string) => {
  return request.get<ResourceSimpleVO[]>(`${BASE_URL}/${id}/resources`);
};

// 资源简单VO
export interface ResourceSimpleVO {
  id: string;
  resourceCode: string;
  resourceName: string;
  resourceType: number;
}

export default {
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleList,
  updateRoleStatus,
  getRoleOptions,
  getRoleResources,
};
