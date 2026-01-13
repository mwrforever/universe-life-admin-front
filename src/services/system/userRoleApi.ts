/**
 * 用户角色关联管理 API
 * 对应后端 AdminUserRoleController
 */

import request from '../../utils/request';

const BASE_URL = '/user/admin/user-role';

// 用户角色详情VO
export interface UserRoleDetailVO {
  id: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  grantedBy: string;
  createdAt: string;
}

// 角色选项VO
export interface RoleOptionVO {
  id: string;
  roleCode: string;
  roleName: string;
}

// 资源简单VO
export interface ResourceSimpleVO {
  id: string;
  resourceCode: string;
  resourceName: string;
  resourceType: number;
}

// 用户权限VO
export interface UserPermissionVO {
  userId: string;
  roles: RoleOptionVO[];
  permissions: ResourceSimpleVO[];
}

// 批量结果VO
export interface BatchResultVO {
  successCount: number;
  failCount: number;
}

// 分配角色请求
export interface AssignRolesRequest {
  userId: string;
  roleIds: string[];
}

// 批量分配角色请求
export interface BatchAssignRoleRequest {
  userIds: string[];
  roleId: string;
}

// 角色ID列表请求
export interface RoleIdsRequest {
  roleIds: string[];
}

// 1. 为用户分配角色
export const assignRolesToUser = (data: AssignRolesRequest) => {
  return request.post<void>(BASE_URL, data);
};

// 2. 获取用户的角色列表
export const getUserRoles = (userId: string) => {
  return request.get<UserRoleDetailVO[]>(`${BASE_URL}/users/${userId}/roles`);
};


// 3. 移除用户的角色
export const removeUserRole = (userId: string, roleId: string) => {
  return request.delete(`${BASE_URL}/users/${userId}/roles/${roleId}`);
};

// 4. 批量移除用户的角色
export const batchRemoveUserRoles = (userId: string, data: RoleIdsRequest) => {
  return request.delete<void>(`${BASE_URL}/users/${userId}/roles`, { data });
};

// 5. 更新用户的角色（全量替换）
export const updateUserRoles = (userId: string, data: RoleIdsRequest) => {
  return request.put(`${BASE_URL}/users/${userId}/roles`, data);
};

// 6. 批量为用户分配角色
export const batchAssignRole = (data: BatchAssignRoleRequest) => {
  return request.post<BatchResultVO>(`${BASE_URL}/batch`, data);
};

// 7. 检查用户是否拥有某角色
export const checkUserHasRole = (userId: string, roleId: string) => {
  return request.get<{ hasRole: boolean }>(`${BASE_URL}/users/${userId}/roles/${roleId}/check`);
};

// 8. 获取用户的所有权限
export const getUserPermissions = (userId: string) => {
  return request.get<UserPermissionVO>(`${BASE_URL}/users/${userId}/permissions`);
};

export default {
  assignRolesToUser,
  getUserRoles,
  removeUserRole,
  batchRemoveUserRoles,
  updateUserRoles,
  batchAssignRole,
  checkUserHasRole,
  getUserPermissions,
};
