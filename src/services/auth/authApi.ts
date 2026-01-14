/**
 * 员工登录 API
 * 基于后端接口文档 v1.0.0
 */

import request from '../../utils/request';
import { OAuth2Service } from '@/services/oauth2/authService';
import { TokenManager } from './tokenManager';

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
export const sendVerifyCode = (data: SendCodeRequest): Promise<ApiResponse<null>> => {
  return request.post(`${COMMON_BASE_URL}/captcha/send`, data);
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
  logout,
};
