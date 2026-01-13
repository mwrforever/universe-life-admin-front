/**
 * 错误通知服务
 * 负责统一管理错误消息的显示和去重
 *
 * @author Universe Life
 * @version 1.0.0
 */

import { showErrorMessage } from '@/utils/antdStatic';
import { BusinessCode, DEFAULT_ERROR_MESSAGES } from '@/types/api';
import { formatErrorMessage } from '@/utils/errorFormatter';

/**
 * 错误通知配置
 */
export interface ErrorNotificationConfig {
  /** 提示持续时间（秒），默认 3 */
  duration?: number;
  /** 是否显示提示，默认 true */
  showNotification?: boolean;
}

/**
 * 错误通知服务
 * 提供错误消息显示和去重功能
 */
export class ErrorNotificationService {
  /** 上一次错误的唯一标识 */
  private static lastErrorKey: string | null = null;
  /** 上一次错误的时间戳 */
  private static lastErrorTime: number = 0;
  /** 去重时间窗口（毫秒），1秒内相同错误不重复显示 */
  private static readonly DEBOUNCE_TIME = 1000;

  /**
   * 显示错误提示（带去重）
   * @param msg 错误消息
   * @param config 配置选项
   */
  static showError(msg: string, config?: ErrorNotificationConfig): void {
    const { duration = 3, showNotification = true } = config || {};

    if (!showNotification) {
      return;
    }

    // 格式化错误消息（每行最多20字，最多5行）
    const formattedMsg = formatErrorMessage(msg, {
      maxCharsPerLine: 20,
      maxLines: 5,
    });

    // 检查是否应该显示（去重逻辑，使用原始消息作为 key）
    if (!this.shouldShowError(msg)) {
      return;
    }

    // 更新最后错误记录（使用原始消息）
    this.lastErrorKey = msg;
    this.lastErrorTime = Date.now();

    // 显示格式化后的错误提示
    showErrorMessage(formattedMsg, duration);
  }

  /**
   * 检查是否应该显示错误（去重逻辑）
   * 1秒内相同的错误消息不重复显示
   * @param errorKey 错误标识（通常是错误消息）
   * @returns 是否应该显示
   */
  static shouldShowError(errorKey: string): boolean {
    const now = Date.now();
    const timeDiff = now - this.lastErrorTime;

    // 如果是相同的错误且在去重时间窗口内，不显示
    if (this.lastErrorKey === errorKey && timeDiff < this.DEBOUNCE_TIME) {
      return false;
    }

    return true;
  }

  /**
   * 获取默认错误消息
   * @param code 业务错误码
   * @returns 默认错误消息
   */
  static getDefaultMessage(code: number): string {
    return DEFAULT_ERROR_MESSAGES[code] || DEFAULT_ERROR_MESSAGES[BusinessCode.GENERAL_ERROR];
  }

  /**
   * 重置去重状态（主要用于测试）
   */
  static reset(): void {
    this.lastErrorKey = null;
    this.lastErrorTime = 0;
  }

  /**
   * 获取去重时间窗口（主要用于测试）
   */
  static getDebounceTime(): number {
    return this.DEBOUNCE_TIME;
  }
}

export default ErrorNotificationService;
