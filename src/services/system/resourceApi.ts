/**
 * 资源管理 API
 * 对应后端 AdminResourceController
 */

import request from '../../utils/request';
import type { ResourceType, CommonStatus, PageResult } from './types';

const BASE_URL = '/user/admin/resource';

// 资源列表查询参数
export interface ResourceListParams {
  page?: number;
  size?: number;
  resourceType?: ResourceType;
  serviceName?: string;
  status?: CommonStatus;
  keyword?: string;
}

// 资源详情VO
export interface ResourceDetailVO {
  id: number;
  resourceCode: string;
  resourceName: string;
  resourceType: ResourceType;
  serviceName?: string;
  urlPattern?: string;
  httpMethod?: string;
  parentId?: number;
  status: CommonStatus;
  sortOrder?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 资源列表VO
export interface ResourceListVO {
  id: number;
  resourceCode: string;
  resourceName: string;
  resourceType: ResourceType;
  serviceName?: string;
  status: CommonStatus;
  sortOrder?: number;
}

// 资源树VO
export interface ResourceTreeVO {
  id: number;
  resourceCode: string;
  resourceName: string;
  resourceType: ResourceType;
  status: CommonStatus;
  children?: ResourceTreeVO[];
}

// 创建资源请求
export interface CreateResourceRequest {
  resourceCode: string;
  resourceName: string;
  resourceType: ResourceType;
  serviceName?: string;
  urlPattern?: string;
  httpMethod?: string;
  parentId?: number;
  status: CommonStatus;
  sortOrder?: number;
  description?: string;
}

// 更新资源请求
export interface UpdateResourceRequest {
  resourceName?: string;
  resourceType?: ResourceType;
  serviceName?: string;
  urlPattern?: string;
  httpMethod?: string;
  parentId?: number;
  sortOrder?: number;
  description?: string;
}

// 3.1 创建资源
export const createResource = (data: CreateResourceRequest) => {
  return request.post<ResourceDetailVO>(BASE_URL, data);
};

// 3.2 获取资源详情
export const getResourceById = (id: number) => {
  return request.get<ResourceDetailVO>(`${BASE_URL}/${id}`);
};

// 3.3 更新资源
export const updateResource = (id: number, data: UpdateResourceRequest) => {
  return request.put<ResourceDetailVO>(`${BASE_URL}/${id}`, data);
};

// 3.4 删除资源
export const deleteResource = (id: number) => {
  return request.delete(`${BASE_URL}/${id}`);
};

// 3.5 分页查询资源列表
export const getResourceList = (params: ResourceListParams) => {
  return request.get<PageResult<ResourceListVO>>(`${BASE_URL}/list`, { params });
};

// 3.6 获取资源树
export const getResourceTree = (serviceName?: string, resourceType?: ResourceType) => {
  return request.get<ResourceTreeVO[]>(`${BASE_URL}/tree`, { params: { serviceName, resourceType } });
};

// 3.7 修改资源状态
export const updateResourceStatus = (id: number, status: CommonStatus) => {
  return request.patch(`${BASE_URL}/${id}/status`, { status });
};

export default {
  createResource,
  getResourceById,
  updateResource,
  deleteResource,
  getResourceList,
  getResourceTree,
  updateResourceStatus,
};
