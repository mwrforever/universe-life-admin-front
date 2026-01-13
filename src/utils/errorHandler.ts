/**
 * 业务错误处理器
 * 根据后端错误响应规范统一处理各类错误
 * 规范文档: api/error-response.md
 *
 * @author Universe Life
 * @version 1.0.0
 */

import { TokenManager } from '@/services/auth/tokenManager';
import { ErrorNotificationService } from '@/services/error/errorNotificationService';
import {
  BusinessCode,
  ErrorType,
  NETWORK_ERROR_MESSAGE,
  REQUEST_CONFIG_ERROR_MESSAGE,
} from '@/types/api';
import type { ApiError } from '@/types/api';
import { httpLogger } from '@/utils/logger';

/**
 * 业务错误处理配置
 */
export interface BusinessErrorHandlerConfig {
  /** 是否显示错误提示，默认 true */
  showNotification?: boolean;
  /** 401 时是否跳转登录页，默认 true */
  redirectOnAuth?: boolean;
}

/**
 * 错误处理结果
 */
export interface HandleResult {
  /** 是否已处理 */
  handled: boolean;
  /** 是否应该 reject */
  shouldReject: boolean;
  /** 错误信息 */
  error?: ApiError;
}

/**
 * 根据业务错误码分类错误类型
 * @param code 业务错误码
 * @returns 错误类型
 */
export function classifyError(code: number): ErrorType {
  switch (code) {
    case BusinessCode.SUCCESS:
      return ErrorType.NONE;
    case BusinessCode.AUTH_ERROR:
      return ErrorType.AUTH;
    case BusinessCode.PERMISSION_ERROR:
      return ErrorType.PERMISSION;
    default:
      return ErrorType.GENERAL;
  }
}

/**
 * 解析错误消息
 * 优先使用后端返回的 message，否则使用默认消息
 * @param message 后端返回的消息
 * @param code 业务错误码
 * @returns 最终显示的错误消息
 */
export function resolveErrorMessage(message: string | undefined | null, code: number): string {
  if (message && message.trim()) {
    return message;
  }
  return ErrorNotificationService.getDefaultMessage(code);
}

/**
 * 处理认证失败错误 (401)
 * - 显示错误提示
 * - 清除本地令牌
 * - 跳转到登录页（如果不在登录页）
 * @param message 错误消息
 * @param config 处理配置
 */
export function handleAuthError(
  message: string,
  config?: BusinessErrorHandlerConfig
): void {
  const { showNotification = true, redirectOnAuth = true } = config || {};

  httpLogger.warn('⚠️ 业务错误: 认证失败 -', message);

  // 清除本地令牌
  TokenManager.clearTokens();

  // 显示错误提示
  if (showNotification) {
    ErrorNotificationService.showError(message);
  }

  // 如果不在登录页，跳转到登录页
  if (redirectOnAuth && window.location.pathname !== '/login') {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
}

/**
 * 处理权限不足错误 (403)
 * - 显示错误提示
 * - 保持在当前页面
 * @param message 错误消息
 * @param config 处理配置
 */
export function handlePermissionError(
  message: string,
  config?: BusinessErrorHandlerConfig
): void {
  const { showNotification = true } = config || {};

  httpLogger.warn('⚠️ 业务错误: 权限不足 -', message);

  if (showNotification) {
    ErrorNotificationService.showError(message);
  }
}

/**
 * 处理一般错误 (0/其它)
 * - 显示错误提示
 * @param message 错误消息
 * @param config 处理配置
 */
export function handleGeneralError(
  message: string,
  config?: BusinessErrorHandlerConfig
): void {
  const { showNotification = true } = config || {};

  httpLogger.error('❌ 业务错误:', message);

  if (showNotification) {
    ErrorNotificationService.showError(message);
  }
}

/**
 * 处理网络错误
 * - 显示网络错误提示
 * @param config 处理配置
 */
export function handleNetworkError(config?: BusinessErrorHandlerConfig): void {
  const { showNotification = true } = config || {};

  httpLogger.error('❌ 网络错误: 请检查您的网络连接');

  if (showNotification) {
    ErrorNotificationService.showError(NETWORK_ERROR_MESSAGE);
  }
}

/**
 * 处理请求配置错误
 * @param errorMessage 原始错误消息
 * @param config 处理配置
 */
export function handleRequestConfigError(
  errorMessage: string,
  config?: BusinessErrorHandlerConfig
): void {
  const { showNotification = true } = config || {};

  httpLogger.error('❌ 请求配置错误:', errorMessage);

  if (showNotification) {
    ErrorNotificationService.showError(REQUEST_CONFIG_ERROR_MESSAGE);
  }
}

/**
 * 统一处理业务错误
 * 根据响应中的 code 字段分发到不同的处理逻辑
 * @param data API 响应数据
 * @param config 处理配置
 * @returns 处理结果
 */
export function handleBusinessError(
  data: { code: number; message: string; data: any },
  config?: BusinessErrorHandlerConfig
): HandleResult {
  const { code, message: msg } = data;
  const errorType = classifyError(code);
  const errorMessage = resolveErrorMessage(msg, code);

  // 业务成功
  if (errorType === ErrorType.NONE) {
    httpLogger.info('✅ 业务成功，返回完整响应:', data);
    return {
      handled: true,
      shouldReject: false,
    };
  }

  // 认证失败
  if (errorType === ErrorType.AUTH) {
    handleAuthError(errorMessage, config);
    return {
      handled: true,
      shouldReject: true,
      error: { code, message: errorMessage },
    };
  }

  // 权限不足
  if (errorType === ErrorType.PERMISSION) {
    handlePermissionError(errorMessage, config);
    return {
      handled: true,
      shouldReject: true,
      error: { code, message: errorMessage },
    };
  }

  // 一般错误
  handleGeneralError(errorMessage, config);
  return {
    handled: true,
    shouldReject: true,
    error: { code, message: errorMessage },
  };
}

export default {
  classifyError,
  resolveErrorMessage,
  handleBusinessError,
  handleAuthError,
  handlePermissionError,
  handleGeneralError,
  handleNetworkError,
  handleRequestConfigError,
};
