/**
 * request 属性测试
 * Feature: error-notification, Property 5: Business Error Trigger
 * Validates: Requirements 6.2, 6.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { handleBusinessError, classifyError } from './errorHandler';
import { BusinessCode, ErrorType } from '@/types/api';

// Mock dependencies
vi.mock('antd', () => ({
  message: {
    error: vi.fn(),
  },
}));

vi.mock('@/services/auth/tokenManager', () => ({
  TokenManager: {
    clearTokens: vi.fn(),
  },
}));

vi.mock('@/utils/logger', () => ({
  httpLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { ErrorNotificationService } from '@/services/error/errorNotificationService';

describe('Property 5: Business Error Trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ErrorNotificationService.reset();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard', href: '' },
      writable: true,
    });
  });


  /**
   * Property: For any HTTP response (regardless of HTTP status code),
   * if the response body contains a code field that is not equal to 1,
   * the error handling flow SHALL be triggered.
   */
  it('should trigger error handling for any non-success code', () => {
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n !== BusinessCode.SUCCESS),
        fc.string(),
        (code, message) => {
          vi.clearAllMocks();
          ErrorNotificationService.reset();

          const result = handleBusinessError(
            { code, message, data: null },
            { showNotification: false, redirectOnAuth: false }
          );

          // 验证：非成功码应该触发错误处理
          expect(result.shouldReject).toBe(true);
          expect(result.handled).toBe(true);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT trigger error handling for success code (1)', () => {
    fc.assert(
      fc.property(fc.string(), fc.anything(), (message, data) => {
        vi.clearAllMocks();
        ErrorNotificationService.reset();

        const result = handleBusinessError(
          { code: BusinessCode.SUCCESS, message, data },
          { showNotification: false }
        );

        // 验证：成功码不应该触发错误处理
        expect(result.shouldReject).toBe(false);
        expect(result.handled).toBe(true);
        expect(result.error).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });


  it('should correctly classify error types for all codes', () => {
    // 测试特定的错误码分类
    expect(classifyError(1)).toBe(ErrorType.NONE);
    expect(classifyError(401)).toBe(ErrorType.AUTH);
    expect(classifyError(403)).toBe(ErrorType.PERMISSION);
    expect(classifyError(0)).toBe(ErrorType.GENERAL);

    // 测试随机的非标准错误码
    fc.assert(
      fc.property(
        fc.integer().filter((n) => n !== 1 && n !== 401 && n !== 403 && n !== 0),
        (code) => {
          expect(classifyError(code)).toBe(ErrorType.GENERAL);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return correct error object structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(401, 403, 0, -1, 500),
        fc.string({ minLength: 1 }),
        (code, message) => {
          vi.clearAllMocks();
          ErrorNotificationService.reset();

          const result = handleBusinessError(
            { code, message, data: null },
            { showNotification: false, redirectOnAuth: false }
          );

          // 验证错误对象结构
          expect(result.error).toHaveProperty('code');
          expect(result.error).toHaveProperty('message');
          expect(result.error?.code).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });
});
