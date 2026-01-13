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
  parentId?: string;  // 父部门ID筛选
  status?: CommonStatus;
  keyword?: string;
}

// 部门详情VO - 与后端接口文档保持一致
export interface DepartmentDetailVO {
  id: string;
  parentId?: string;
  parentName?: string;
  deptCode: string;      // 部门编码
  deptName: string;      // 部门名称
  leaderId?: string;
  leaderName?: string;
  sortOrder?: number;
  status: CommonStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 部门列表VO
export interface DepartmentListVO {
  id: string;
  parentId?: string;
  deptCode: string;
  deptName: string;
  leaderName?: string;
  sortOrder?: number;
  status: CommonStatus;
  createdAt: string;
}

// 部门树VO
export interface DepartmentTreeVO {
  id: string;
  parentId?: string;
  deptCode: string;
  deptName: string;
  leaderName?: string;
  sortOrder?: number;
  status?: CommonStatus;
  children?: DepartmentTreeVO[];
}

// 部门选项VO
export interface DepartmentOptionVO {
  id: string;
  deptCode: string;
  deptName: string;
}

// 创建部门请求 - 与后端接口文档保持一致
export interface CreateDepartmentRequest {
  parentId?: string;       // 父部门ID（0为顶级部门）
  deptCode: string;        // 部门编码（唯一标识），必填
  deptName: string;        // 部门名称，必填
  leaderId?: string;       // 部门负责人ID
  sortOrder?: number;      // 排序序号
  status?: CommonStatus;   // 状态：0-禁用 1-启用
  description?: string;    // 部门描述
}

// 更新部门请求
export interface UpdateDepartmentRequest {
  parentId?: string;       // 父部门ID（0为顶级部门）
  deptName?: string;       // 部门名称
  leaderId?: string;       // 部门负责人ID
  sortOrder?: number;      // 排序序号
  status?: CommonStatus;   // 状态：0-禁用 1-启用
  description?: string;    // 部门描述
}

// 7.1 创建部门
export const createDepartment = (data: CreateDepartmentRequest) => {
  return request.post<void>(BASE_URL, data);
};

// 7.2 获取部门详情
export const getDepartmentById = (id: string) => {
  return request.get<DepartmentDetailVO>(`${BASE_URL}/${id}`);
};

// 7.3 更新部门
export const updateDepartment = (id: string, data: UpdateDepartmentRequest) => {
  return request.put<void>(`${BASE_URL}/${id}`, data);
};

// 7.4 删除部门
export const deleteDepartment = (id: string) => {
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
export const updateDepartmentStatus = (id: string, status: CommonStatus) => {
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
