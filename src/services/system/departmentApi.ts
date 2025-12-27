/**
 * 部门管理 API
 * 对应后端 AdminDepartmentController
 */

import request from '../../utils/request';
import type { CommonStatus, PageResult } from './types';

const BASE_URL = '/user/admin/department';

// 部门列表查询参数
export interface DepartmentListParams {
  page?: number;
  size?: number;
  status?: CommonStatus;
  keyword?: string;
}

// 部门详情VO
export interface DepartmentDetailVO {
  id: number;
  departmentCode: string;
  departmentName: string;
  parentId?: number;
  parentName?: string;
  leaderId?: number;
  leaderName?: string;
  status: CommonStatus;
  sortOrder?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 部门列表VO
export interface DepartmentListVO {
  id: number;
  departmentCode: string;
  departmentName: string;
  parentId?: number;
  parentName?: string;
  leaderName?: string;
  status: CommonStatus;
  sortOrder?: number;
}

// 部门树VO
export interface DepartmentTreeVO {
  id: number;
  departmentCode: string;
  departmentName: string;
  status: CommonStatus;
  children?: DepartmentTreeVO[];
}

// 部门选项VO
export interface DepartmentOptionVO {
  id: number;
  departmentCode: string;
  departmentName: string;
}

// 创建部门请求
export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  parentId?: number;
  leaderId?: number;
  status?: CommonStatus;
  sortOrder?: number;
  description?: string;
}

// 更新部门请求
export interface UpdateDepartmentRequest {
  departmentName?: string;
  parentId?: number;
  leaderId?: number;
  sortOrder?: number;
  description?: string;
}

// 7.1 创建部门
export const createDepartment = (data: CreateDepartmentRequest) => {
  return request.post<DepartmentDetailVO>(BASE_URL, data);
};

// 7.2 获取部门详情
export const getDepartmentById = (id: number) => {
  return request.get<DepartmentDetailVO>(`${BASE_URL}/${id}`);
};

// 7.3 更新部门
export const updateDepartment = (id: number, data: UpdateDepartmentRequest) => {
  return request.put<DepartmentDetailVO>(`${BASE_URL}/${id}`, data);
};

// 7.4 删除部门
export const deleteDepartment = (id: number) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 7.5 分页查询部门列表
export const getDepartmentList = (params: DepartmentListParams) => {
  return request.get<PageResult<DepartmentListVO>>(`${BASE_URL}/list`, { params });
};

// 7.6 获取部门树
export const getDepartmentTree = () => {
  return request.get<DepartmentTreeVO[]>(`${BASE_URL}/tree`);
};

// 7.7 修改部门状态
export const updateDepartmentStatus = (id: number, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

// 7.8 获取部门选项列表
export const getDepartmentOptions = () => {
  return request.get<DepartmentOptionVO[]>(`${BASE_URL}/options`);
};

export default {
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentList,
  getDepartmentTree,
  updateDepartmentStatus,
  getDepartmentOptions,
};
