/**
 * API 响应类型定义
 * 基于后端错误响应规范: api/error-response.md
 *
 * @author Universe Life
 * @version 1.0.0
 */

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number;      // 业务状态码：1=成功, 401=认证失败, 403=权限不足, 0=其它错误
  message: string;   // 响应消息
  data: T | null;    // 响应数据
}

/**
 * 业务错误码枚举
 */
export enum BusinessCode {
  /** 请求成功 */
  SUCCESS = 1,
  /** 认证失败或未认证 */
  AUTH_ERROR = 401,
  /** 权限不足 */
  PERMISSION_ERROR = 403,
  /** 其它错误 */
  GENERAL_ERROR = 0,
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 无错误 */
  NONE = 'none',
  /** 认证错误 */
  AUTH = 'auth',
  /** 权限错误 */
  PERMISSION = 'permission',
  /** 一般错误 */
  GENERAL = 'general',
  /** 网络错误 */
  NETWORK = 'network',
}

/**
 * 默认错误消息映射
 */
export const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  [BusinessCode.AUTH_ERROR]: '认证失败，请重新登录',
  [BusinessCode.PERMISSION_ERROR]: '权限不足，无法访问该资源',
  [BusinessCode.GENERAL_ERROR]: '系统异常，请稍后重试',
};

/**
 * 网络错误消息
 */
export const NETWORK_ERROR_MESSAGE = '网络连接失败，请检查网络设置';

/**
 * 请求配置错误消息
 */
export const REQUEST_CONFIG_ERROR_MESSAGE = '请求配置错误';

/**
 * API 错误接口
 */
export interface ApiError {
  code: number;
  message: string;
}
