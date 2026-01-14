/**
 * 系统用户个人资料 API
 * 用于当前登录用户管理自己的个人资料和密码
 * 对应后端 AdminSysUserController 的 person/profile 相关接口
 * 
 * 注意：这些接口与登录时的 /profile 接口区分，专用于个人资料页面
 */

import request from '../../utils/request';
import type { Gender } from './types';
import type { DepartmentSimpleVO } from './employeeApi';

const BASE_URL = '/user/admin/sys-user';

// ============== API 响应类型 ==============

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ============== 类型定义 ==============

/**
 * 当前用户个人资料响应
 * GET /admin/sys-user/person/profile
 */
export interface SysUserProfileVO {
  id: number;
  employeeNo: string;
  username: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;        // 原始头像key（未签名）
  gender?: Gender;
  status: number;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  departments?: DepartmentSimpleVO[];
  primaryDepartment?: DepartmentSimpleVO;
}

/**
 * 更新当前用户个人资料请求
 * PUT /admin/sys-user/person/profile
 */
export interface UpdateProfileRequest {
  username?: string;
  realName?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;        // 原始头像key（未签名）
  gender?: Gender;
}

/**
 * 密码修改验证方式
 */
export const VerificationType = {
  PASSWORD: 0,        // 原密码验证
  EMAIL_CAPTCHA: 1,   // 邮箱验证码
  PHONE_CAPTCHA: 2,   // 手机验证码
} as const;
export type VerificationType = typeof VerificationType[keyof typeof VerificationType];

/**
 * 修改密码请求
 * PUT /admin/sys-user/person/profile/password
 */
export interface UpdatePasswordRequest {
  verificationType: VerificationType;
  currentPassword?: string;   // verificationType=0时必填
  captcha?: string;           // verificationType=1或2时必填
  captchaUsageType?: number;  // verificationType=1或2时必填，值为3（密码重置验证）
  newPassword: string;
}

// ============== API 方法 ==============

/**
 * 获取当前登录用户的个人资料
 * GET /admin/sys-user/person/profile
 * 
 * 注意：与登录时的 /profile 接口区分，该接口专用于个人资料页面
 */
export const getPersonProfile = async (): Promise<ApiResponse<SysUserProfileVO>> => {
  return request.get(`${BASE_URL}/person/profile`);
};

/**
 * 更新当前登录用户的个人资料
 * PUT /admin/sys-user/person/profile
 */
export const updatePersonProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<void>> => {
  return request.put(`${BASE_URL}/person/profile`, data);
};

/**
 * 修改当前登录用户的密码
 * PUT /admin/sys-user/person/profile/password
 * 支持三种验证方式：原密码、邮箱验证码、手机验证码
 */
export const updatePersonPassword = async (data: UpdatePasswordRequest): Promise<ApiResponse<void>> => {
  return request.put(`${BASE_URL}/person/profile/password`, data);
};

export default {
  getPersonProfile,
  updatePersonProfile,
  updatePersonPassword,
};
