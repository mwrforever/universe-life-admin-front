/**
 * 平台员工管理 API
 * 对应后端 AdminSysUserController
 */

import request from '../../utils/request';
import type { CommonStatus, Gender, PageResult } from './types';

const BASE_URL = '/user/admin/sys-user';

// 员工列表查询参数
export interface EmployeeListParams {
  page?: number;
  size?: number;
  departmentId?: string;
  status?: CommonStatus;
  keyword?: string;
}

// 员工详情VO
export interface SysUserDetailVO {
  id: string;
  employeeNo: string;
  username: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: Gender;
  status: CommonStatus;
  departmentIds?: string[];
  departments?: DepartmentInfo[];
  primaryDepartmentId?: string;
  createdAt: string;
  updatedAt: string;
}

// 部门信息
export interface DepartmentInfo {
  id: string;
  departmentName: string;
  isPrimary: boolean;
}

// 员工列表VO
export interface SysUserListVO {
  id: string;
  employeeNo: string;
  username: string;
  realName?: string;
  phone?: string;
  status: CommonStatus;
  departmentName?: string;
}

// 员工选项VO
export interface SysUserOptionVO {
  id: string;
  employeeNo: string;
  realName: string;
}

// 创建员工请求
export interface CreateEmployeeRequest {
  employeeNo: string;
  username: string;
  password: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: CommonStatus;
  departmentIds?: string[];
  primaryDepartmentId?: string;
}

// 更新员工请求
export interface UpdateEmployeeRequest {
  realName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: Gender;
  status?: CommonStatus;
  departmentIds?: string[];
  primaryDepartmentId?: string;
}

// 8.1 创建员工
export const createEmployee = (data: CreateEmployeeRequest) => {
  return request.post<SysUserDetailVO>(BASE_URL, data);
};

// 8.2 获取员工详情
export const getEmployeeById = (id: string) => {
  return request.get<SysUserDetailVO>(`${BASE_URL}/${id}`);
};

// 8.3 更新员工
export const updateEmployee = (id: string, data: UpdateEmployeeRequest) => {
  return request.put<SysUserDetailVO>(`${BASE_URL}/${id}`, data);
};

// 8.4 删除员工
export const deleteEmployee = (id: string) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 8.5 分页查询员工列表
export const getEmployeeList = (params: EmployeeListParams) => {
  return request.get<PageResult<SysUserListVO>>(`${BASE_URL}/list`, { params });
};

// 8.6 修改员工状态
export const updateEmployeeStatus = (id: string, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

// 8.7 重置员工密码
export const resetEmployeePassword = (id: string, newPassword: string) => {
  return request.put(`${BASE_URL}/${id}/password`, { newPassword });
};

// 8.8 获取员工选项列表
export const getEmployeeOptions = () => {
  return request.get<SysUserOptionVO[]>(`${BASE_URL}/options`);
};

export default {
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeList,
  updateEmployeeStatus,
  resetEmployeePassword,
  getEmployeeOptions,
};
