/**
 * ErrorNotificationService 属性测试
 * Feature: error-notification, Property 4: Error Deduplication
 * Validates: Requirements 5.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Mock antdStatic module - 必须在导入 ErrorNotificationService 之前
vi.mock('@/utils/antdStatic', () => ({
  showErrorMessage: vi.fn(),
}));

import { ErrorNotificationService } from './errorNotificationService';
import { showErrorMessage } from '@/utils/antdStatic';

// 获取 mock 函数引用
const mockShowErrorMessage = vi.mocked(showErrorMessage);

describe('ErrorNotificationService', () => {
  beforeEach(() => {
    // 重置服务状态
    ErrorNotificationService.reset();
    // 清除 mock 调用记录
    mockShowErrorMessage.mockClear();
  });

  describe('Property 4: Error Deduplication', () => {
    /**
     * Property: For any sequence of identical error messages within 1 second,
     * the system SHALL display only the first error and suppress subsequent duplicates.
     */
    it('should deduplicate identical errors within debounce window', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 2, max: 10 }),
          (errorMessage, repeatCount) => {
            // 重置状态
            ErrorNotificationService.reset();
            mockShowErrorMessage.mockClear();

            // 连续显示相同的错误消息
            for (let i = 0; i < repeatCount; i++) {
              ErrorNotificationService.showError(errorMessage);
            }

            // 验证：只应该显示一次
            expect(mockShowErrorMessage).toHaveBeenCalledTimes(1);
            expect(mockShowErrorMessage).toHaveBeenCalledWith(errorMessage, 3);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Different error messages should all be displayed
     */
    it('should display all different error messages', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 }),
          (errorMessages) => {
            // 确保消息都不同
            const uniqueMessages = [...new Set(errorMessages)];
            if (uniqueMessages.length < 2) return true; // 跳过没有足够唯一消息的情况

            // 重置状态
            ErrorNotificationService.reset();
            mockShowErrorMessage.mockClear();

            // 显示不同的错误消息
            uniqueMessages.forEach((msg) => {
              ErrorNotificationService.showError(msg);
            });

            // 验证：每个不同的消息都应该显示
            expect(mockShowErrorMessage).toHaveBeenCalledTimes(uniqueMessages.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('shouldShowError', () => {
    it('should return true for first error', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorKey) => {
          ErrorNotificationService.reset();
          expect(ErrorNotificationService.shouldShowError(errorKey)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should return false for same error within debounce window', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorKey) => {
          ErrorNotificationService.reset();
          mockShowErrorMessage.mockClear();

          // 第一次显示
          ErrorNotificationService.showError(errorKey);

          // 立即检查相同错误
          expect(ErrorNotificationService.shouldShowError(errorKey)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('getDefaultMessage', () => {
    it('should return correct default message for known codes', () => {
      expect(ErrorNotificationService.getDefaultMessage(401)).toBe('认证失败，请重新登录');
      expect(ErrorNotificationService.getDefaultMessage(403)).toBe('权限不足，无法访问该资源');
      expect(ErrorNotificationService.getDefaultMessage(0)).toBe('系统异常，请稍后重试');
    });

    it('should return general error message for unknown codes', () => {
      fc.assert(
        fc.property(
          fc.integer().filter((n) => n !== 1 && n !== 401 && n !== 403 && n !== 0),
          (unknownCode) => {
            expect(ErrorNotificationService.getDefaultMessage(unknownCode)).toBe('系统异常，请稍后重试');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('showError with config', () => {
    it('should not show error when showNotification is false', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorMessage) => {
          ErrorNotificationService.reset();
          mockShowErrorMessage.mockClear();

          ErrorNotificationService.showError(errorMessage, { showNotification: false });

          expect(mockShowErrorMessage).not.toHaveBeenCalled();
        }),
        { numRuns: 100 }
      );
    });

    it('should use custom duration when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 1, max: 10 }),
          (errorMessage, duration) => {
            ErrorNotificationService.reset();
            mockShowErrorMessage.mockClear();

            ErrorNotificationService.showError(errorMessage, { duration });

            expect(mockShowErrorMessage).toHaveBeenCalledWith(errorMessage, duration);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
