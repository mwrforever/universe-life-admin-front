/**
 * 员工登录 API
 * 基于后端接口文档 v1.0.0
 */

import request from '../../utils/request';

const BASE_URL = '/employee';

// 密码登录请求
export interface PasswordLoginRequest {
  identification: string;  // 用户标识（工号/邮箱/手机号/用户名）
  password: string;
}

// 验证码登录请求
export interface CaptchaLoginRequest {
  identification: string;  // 用户标识（邮箱/手机号）
  verifyCode: string;      // 验证码
  usageType: number;       // 验证码用途类型：1-登录验证
}

// 发送验证码请求
export interface SendCodeRequest {
  identification: string;  // 邮箱或手机号
  usageType: number;       // 验证码用途类型
}

// Token数据
export interface TokenData {
  access_token: string;         // 访问令牌 (JWT)
  refresh_token: string;        // 刷新令牌
  id_token: string;             // ID令牌 (JWT)，包含用户身份信息
  token_type: string;           // 令牌类型，固定为 "Bearer"
  expires_in: number;           // 访问令牌过期时间（秒），默认7200秒
  refresh_expires_in: number;   // 刷新令牌过期时间（秒），默认604800秒
}

// 统一响应格式
export interface ApiResponse<T> {
  code: number;      // 响应状态码，1表示成功
  message: string;   // 响应消息
  data: T | null;    // 响应数据
  timestamp: number; // 响应时间戳
}

// 登录响应
export type LoginResponse = ApiResponse<TokenData>;

// 刷新Token请求
export interface RefreshTokenRequest {
  refresh_token: string;
}

// 刷新Token响应
export type RefreshTokenResponse = ApiResponse<TokenData>;

/**
 * 密码登录
 * POST /employee/login/password
 */
export const loginByPassword = (data: PasswordLoginRequest) => {
  return request.post<LoginResponse>(`${BASE_URL}/login/password`, data);
};

/**
 * 验证码登录
 * POST /employee/login/captcha
 */
export const loginByCaptcha = (data: CaptchaLoginRequest) => {
  return request.post<LoginResponse>(`${BASE_URL}/login/captcha`, data);
};

/**
 * 发送验证码
 * 注意：此接口路径需根据实际后端实现调整
 */
export const sendVerifyCode = (data: SendCodeRequest) => {
  return request.post<ApiResponse<null>>(`${BASE_URL}/captcha/send`, data);
};

/**
 * 刷新Token
 * POST /employee/refresh
 */
export const refreshToken = (refreshTokenValue: string) => {
  return request.post<RefreshTokenResponse>(`${BASE_URL}/refresh`, { 
    refresh_token: refreshTokenValue 
  });
};

/**
 * 登出
 */
export const logout = () => {
  return request.post<ApiResponse<null>>(`${BASE_URL}/logout`);
};

export default {
  loginByPassword,
  loginByCaptcha,
  sendVerifyCode,
  refreshToken,
  logout,
};
