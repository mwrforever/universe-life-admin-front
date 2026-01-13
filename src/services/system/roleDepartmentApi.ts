/**
 * 部门角色关联管理 API
 * 对应后端 AdminRoleDepartmentController
 */

import request from '../../utils/request';

const BASE_URL = '/user/admin/role-department';

// 部门简单VO
export interface SysDepartmentSimpleVO {
  id: string;
  deptCode: string;
  deptName: string;
}

// 角色选项VO
export interface RoleOptionVO {
  id: string;
  roleCode: string;
  roleName: string;
}

// 批量分配部门角色请求
export interface AssignDepartmentsRequest {
  roleId: string;
  departmentIds: string[];
}

// 1. 批量分配部门角色
export const assignDepartmentsToRole = (data: AssignDepartmentsRequest) => {
  return request.post(BASE_URL, data);
};

// 2. 批量移除部门角色
export const removeDepartmentsFromRole = (data: AssignDepartmentsRequest) => {
  return request.delete(BASE_URL, { data });
};

// 3. 获取角色关联的部门
export const getRoleDepartments = (roleId: string) => {
  return request.get<SysDepartmentSimpleVO[]>(`${BASE_URL}/role/${roleId}`);
};

// 4. 获取部门关联的角色
export const getDepartmentRoles = (departmentId: string) => {
  return request.get<RoleOptionVO[]>(`${BASE_URL}/department/${departmentId}`);
};

export default {
  assignDepartmentsToRole,
  removeDepartmentsFromRole,
  getRoleDepartments,
  getDepartmentRoles,
};
