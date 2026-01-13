/**
 * 用户详情管理 API
 * 对应后端 AdminUserDetailController
 */

import request from '../../utils/request';

const BASE_URL = '/user/admin/detail';

// 用户详情VO
export interface UserDetailVO {
  id: string;
  ext?: string;           // 扩展字段（JSON格式）
  bio?: string;           // 简介
  receiveOrder?: number;  // 接单数
  birthday?: string;      // 生日
  province?: string;      // 省份
  city?: string;          // 城市
  country?: string;       // 国家
  road?: string;          // 街道地址
  address?: string;       // 详细地址
  createdAt: string;
  updatedAt: string;
}

// 更新用户详情请求
export interface UpdateUserDetailRequest {
  bio?: string;           // 简介
  birthday?: string;      // 生日
  province?: string;      // 省份
  city?: string;          // 城市
  country?: string;       // 国家
  road?: string;          // 街道地址
  address?: string;       // 详细地址
  ext?: string;           // 扩展字段（JSON格式）
}

// 1. 获取用户详情
export const getUserDetail = (id: string) => {
  return request.get<UserDetailVO>(`${BASE_URL}/${id}`);
};

// 2. 更新用户详情
export const updateUserDetail = (id: string, data: UpdateUserDetailRequest) => {
  return request.put<void>(`${BASE_URL}/${id}`, data);
};

export default {
  getUserDetail,
  updateUserDetail,
};
