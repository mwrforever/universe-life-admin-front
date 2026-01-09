/**
 * 员工登录 API
 * 基于后端接口文档 v1.0.0
 */

import request from '../../utils/request';
import { OAuth2Service } from '@/services/oauth2/authService';
import { TokenManager } from './tokenManager';

// 注意：request 的 baseURL 已经是 /api，所以这里不需要再加 /api 前缀
// 登录接口：/api/employee -> 代理去掉/api -> http://localhost:8099/employee
const AUTH_BASE_URL = '/employee';

// 发送验证码：/api/common -> 代理保留/api -> http://localhost:8101/api/common
const COMMON_BASE_URL = '/common';

// 密码登录请求
export interface PasswordLoginRequest {
  identification: string;  // 用户标识（用户名/手机号/邮箱）
  password: string;
}

// 验证码登录请求
export interface CaptchaLoginRequest {
  identification: string;  // 用户标识（用户名/手机号/邮箱）
  captcha: string;         // 验证码
  captchaUsageType: number; // 验证码用途类型：1-登录验证
}

// 用户认证类型枚举
export enum UserAuthType {
  WeChat = 0,      // 微信
  QQ = 1,          // QQ
  Alipay = 2,      // 支付宝
  Weibo = 3,       // 微博
  Username = 4,    // 用户名
  Phone = 5,       // 手机号
  Email = 6,       // 邮箱
}

// 验证码用途类型枚举
export enum CaptchaUsageType {
  Login = 1,           // 安全登录验证
  Register = 2,        // 用户注册验证
  ResetPassword = 3,   // 密码重置验证
  BindEmail = 4,       // 邮箱绑定验证
  UnbindEmail = 5,     // 邮箱解绑验证
  ModifyPayPassword = 6, // 支付密码修改验证
}

// 发送验证码请求
export interface SendCodeRequest {
  identification: string;        // 邮箱或手机号
  identificationType: UserAuthType;  // 认证类型: 5-手机号, 6-邮箱
  captchaUsageType: CaptchaUsageType; // 验证码用途类型: 1-登录验证
}

// Token数据 - 适配后端API返回格式
// 注意：后端登录接口返回的data字段直接包含以下字段（camelCase）
export interface TokenData {
  accessToken: string;   // 访问令牌 (JWT)
  refreshToken: string;  // 刷新令牌
  expiresIn: string;     // 访问令牌过期时间（秒数或毫秒时间戳）
  tokenType: string;     // 令牌类型，默认为 "Bearer"
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
 * POST /api/employee/login/password -> 代理 -> http://localhost:8099/employee/login/password
 */
export const loginByPassword = (data: PasswordLoginRequest) => {
  return request.post<LoginResponse>(`${AUTH_BASE_URL}/login/password`, data);
};

/**
 * 验证码登录
 * POST /api/employee/login/captcha -> 代理 -> http://localhost:8099/employee/login/captcha
 */
export const loginByCaptcha = (data: CaptchaLoginRequest) => {
  return request.post<LoginResponse>(`${AUTH_BASE_URL}/login/captcha`, data);
};

/**
 * 发送验证码
 * POST /captcha/send (需要包含 identificationType 自动识别手机号/邮箱)
 */
export const sendVerifyCode = (data: SendCodeRequest) => {
  return request.post<ApiResponse<null>>(`${COMMON_BASE_URL}/captcha/send`, data);
};

/**
 * 刷新Token - 使用OAuth2标准端点
 * POST /oauth2/token?grant_type=refresh_token
 * @throws {Error} 当Token刷新失败时抛出异常
 */
export const refreshToken = async (refreshTokenValue: string) => {
  // 直接调用OAuth2Service，它现在会抛出异常
  await OAuth2Service.refreshAccessToken();

  // 返回兼容的响应格式（供现有代码使用）
  const accessToken = TokenManager.getAccessToken();
  const refreshToken = TokenManager.getRefreshToken();

  return {
    code: 1,
    message: 'success',
    data: {
      accessToken: accessToken!,
      refreshToken: refreshToken!,
      expiresIn: '7200', // 2小时，转换为字符串
      tokenType: 'Bearer', // 添加 tokenType 字段
    },
    timestamp: Date.now(),
  } as RefreshTokenResponse;
};

/**
/**
 * 获取当前登录用户信息
 * GET /api/user/admin/sys-user/profile
 */
/**
 * 获取当前登录用户信息
 * GET /api/user/admin/sys-user/profile
 */
export const getUserProfile = () => {
  return request.get<ApiResponse<any>>('/user/admin/sys-user/profile');
};

/**
 * 登出 - 使用OAuth2标准撤销端点
 * 依次撤销access_token和refresh_token
 */
export const logout = async () => {
  try {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    // 1. 先撤销access_token（如果存在）
    if (accessToken) {
      await OAuth2Service.revokeToken(accessToken, 'access_token');
    }

    // 2. 再撤销refresh_token（如果存在）
    if (refreshToken) {
      await OAuth2Service.revokeToken(refreshToken, 'refresh_token');
    }

    return {
      code: 1,
      message: '登出成功',
      data: null,
      timestamp: Date.now(),
    } as ApiResponse<null>;
  } catch (error) {
    // 即使撤销失败，也继续清理本地数据
    return {
      code: 0,
      message: error instanceof Error ? error.message : '登出失败',
      data: null,
      timestamp: Date.now(),
    } as ApiResponse<null>;
  }
};

export default {
  loginByPassword,
  loginByCaptcha,
  sendVerifyCode,
  getUserProfile,
  refreshToken,
  logout,
};
