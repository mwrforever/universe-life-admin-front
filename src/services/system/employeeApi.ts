/**
 * 平台员工管理 API
 * 对应后端 AdminSysUserController
 */

import request from '../../utils/request';
import type { CommonStatus, Gender, PageResult } from './types';

const BASE_URL = '/user/admin/sys-user';

// 部门简单VO
export interface DepartmentSimpleVO {
  id: string;
  deptCode: string;
  deptName: string;
}

// 登录响应VO
export interface LoginResponseVO {
  sysUserId: number;
  username: string;
  password: string;
  status: CommonStatus;
  permissions: string[];
}

// 个人资料VO
export interface ProfileVO {
  employeeNo: string;
  avatar: string;
}

// 员工列表查询参数
export interface EmployeeListParams {
  page?: number;
  size?: number;
  departmentId?: string;
  status?: CommonStatus;
  keyword?: string;
}

// 员工详情VO - 与后端接口文档保持一致
export interface SysUserDetailVO {
  id: string;
  employeeNo: string;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: Gender;
  status: CommonStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  departments?: DepartmentSimpleVO[];
  primaryDepartment?: DepartmentSimpleVO;
}

// 员工列表VO
export interface SysUserListVO {
  id: string;
  employeeNo: string;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: Gender;
  status: CommonStatus;
  primaryDeptName?: string;
  lastLoginAt?: string;
  createdAt: string;
}


// 员工选项VO
export interface SysUserOptionVO {
  id: string;
  employeeNo: string;
  realName: string;
}

// 创建员工请求 - 与后端接口文档保持一致
export interface CreateEmployeeRequest {
  // employeeNo 由后端自动生成，不需要传递
  username: string;          // 用户名（登录名），必填
  password: string;          // 密码，必填
  realName?: string;         // 真实姓名
  phone?: string;            // 手机号
  email?: string;            // 邮箱
  avatarUrl?: string;        // 头像URL
  gender?: Gender;           // 性别
  status?: CommonStatus;     // 状态：0-禁用 1-启用
  departmentIds?: string[];  // 部门ID列表
  primaryDepartmentId?: string; // 主部门ID
}

// 更新员工请求
export interface UpdateEmployeeRequest {
  realName?: string;         // 真实姓名
  phone?: string;            // 手机号
  email?: string;            // 邮箱
  avatarUrl?: string;        // 头像URL
  gender?: Gender;           // 性别
  status?: CommonStatus;     // 状态：0-禁用 1-启用
  departmentIds?: string[];  // 部门ID列表
  primaryDepartmentId?: string; // 主部门ID
}

// 1. 登录查询
export const login = (username: string) => {
  return request.get<LoginResponseVO>(`${BASE_URL}/login`, { params: { username } });
};

// 2. 创建员工
export const createEmployee = (data: CreateEmployeeRequest) => {
  return request.post<void>(BASE_URL, data);
};

// 3. 获取员工详情
export const getEmployeeById = (id: string) => {
  return request.get<SysUserDetailVO>(`${BASE_URL}/${id}`);
};

// 4. 更新员工
export const updateEmployee = (id: string, data: UpdateEmployeeRequest) => {
  return request.put<void>(`${BASE_URL}/${id}`, data);
};

// 5. 删除员工
export const deleteEmployee = (id: string) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 6. 分页查询员工列表
export const getEmployeeList = (params: EmployeeListParams) => {
  return request.get<PageResult<SysUserListVO>>(`${BASE_URL}/list`, { params });
};

// 7. 修改员工状态
export const updateEmployeeStatus = (id: string, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

// 8. 重置员工密码
export const resetEmployeePassword = (id: string, newPassword: string) => {
  return request.put(`${BASE_URL}/${id}/password`, { newPassword });
};

// 9. 获取员工选项列表
export const getEmployeeOptions = () => {
  return request.get<SysUserOptionVO[]>(`${BASE_URL}/options`);
};

// 10. 获取员工权限列表
export const getSysUserPermissions = (sysUserId: string) => {
  return request.get<string[]>(`${BASE_URL}/${sysUserId}/permissions`);
};

// 11. 获取当前用户资料
export const getProfile = () => {
  return request.get<ProfileVO>(`${BASE_URL}/profile`);
};

export default {
  login,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeList,
  updateEmployeeStatus,
  resetEmployeePassword,
  getEmployeeOptions,
  getSysUserPermissions,
  getProfile,
};
