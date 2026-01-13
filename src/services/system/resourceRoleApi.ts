/**
 * 资源角色关联管理 API
 * 对应后端 AdminResourceRoleController
 */

import request from '../../utils/request';

const BASE_URL = '/user/admin/resource-role';

// 资源角色VO
export interface ResourceRoleVO {
  id: string;
  roleId: string;
  resourceId: string;
  resourceCode: string;
  resourceName: string;
  resourceType: number;
  grantedBy: string;
  createdAt: string;
}

// 角色选项VO
export interface RoleOptionVO {
  id: string;
  roleCode: string;
  roleName: string;
}

// 资源树VO
export interface ResourceTreeVO {
  id: string;
  resourceCode: string;
  resourceName: string;
  resourceType: number;
  checked: boolean;
  children?: ResourceTreeVO[];
}

// 批量结果VO
export interface BatchResultVO {
  successCount: number;
  failCount: number;
}

// 分配资源权限请求
export interface AssignResourcesRequest {
  roleId: string;
  resourceIds: string[];
}

// 资源ID列表请求
export interface ResourceIdsRequest {
  resourceIds: string[];
}

// 批量分配资源权限请求
export interface BatchAssignResourceRequest {
  roleIds: string[];
  resourceId: string;
}

// 1. 为角色分配资源权限
export const assignResourcesToRole = (data: AssignResourcesRequest) => {
  return request.post<void>(BASE_URL, data);
};

// 2. 获取角色的资源权限列表
export const getRoleResources = (roleId: string) => {
  return request.get<ResourceRoleVO[]>(`${BASE_URL}/roles/${roleId}/resources`);
};


// 3. 移除角色的资源权限
export const removeRoleResource = (roleId: string, resourceId: string) => {
  return request.delete(`${BASE_URL}/roles/${roleId}/resources/${resourceId}`);
};

// 4. 批量移除角色的资源权限
export const batchRemoveRoleResources = (roleId: string, data: ResourceIdsRequest) => {
  return request.delete<void>(`${BASE_URL}/roles/${roleId}/resources`, { data });
};

// 5. 更新角色的资源权限（全量替换）
export const updateRoleResources = (roleId: string, data: ResourceIdsRequest) => {
  return request.put(`${BASE_URL}/roles/${roleId}/resources`, data);
};

// 6. 获取拥有某资源权限的角色列表
export const getResourceRoles = (resourceId: string) => {
  return request.get<RoleOptionVO[]>(`${BASE_URL}/resources/${resourceId}/roles`);
};

// 7. 检查角色是否拥有某资源权限
export const checkRoleHasResource = (roleId: string, resourceId: string) => {
  return request.get<{ hasPermission: boolean }>(`${BASE_URL}/roles/${roleId}/resources/${resourceId}/check`);
};

// 8. 获取角色的资源权限树
export const getRoleResourceTree = (roleId: string) => {
  return request.get<ResourceTreeVO[]>(`${BASE_URL}/roles/${roleId}/resources/tree`);
};

// 9. 批量为角色分配资源权限
export const batchAssignResource = (data: BatchAssignResourceRequest) => {
  return request.post<BatchResultVO>(`${BASE_URL}/batch`, data);
};

// 10. 检查用户是否拥有某资源权限
export const checkUserHasResource = (userId: string, resourceCode: string) => {
  return request.get<{ hasPermission: boolean }>(`${BASE_URL}/users/${userId}/resources/${resourceCode}/check`);
};

export default {
  assignResourcesToRole,
  getRoleResources,
  removeRoleResource,
  batchRemoveRoleResources,
  updateRoleResources,
  getResourceRoles,
  checkRoleHasResource,
  getRoleResourceTree,
  batchAssignResource,
  checkUserHasResource,
};
