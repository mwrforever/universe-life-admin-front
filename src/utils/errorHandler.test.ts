/**
 * errorHandler 属性测试
 * Feature: error-notification
 *
 * Property 1: Error Code Classification - Validates: Requirements 1.2, 1.3, 1.4
 * Property 2: Message Extraction - Validates: Requirements 1.5, 3.2, 4.1
 * Property 3: Auth Error Token Cleanup - Validates: Requirements 2.2
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  classifyError,
  resolveErrorMessage,
  handleAuthError,
  handleBusinessError,
} from './errorHandler';
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

import { TokenManager } from '@/services/auth/tokenManager';
import { ErrorNotificationService } from '@/services/error/errorNotificationService';


describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ErrorNotificationService.reset();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/dashboard', href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 1: Error Code Classification', () => {
    /**
     * Property: For any API response with a code field, the error handler SHALL
     * correctly classify it as Success/Auth/Permission/General error.
     */
    it('should classify code=1 as NONE (success)', () => {
      expect(classifyError(BusinessCode.SUCCESS)).toBe(ErrorType.NONE);
    });

    it('should classify code=401 as AUTH error', () => {
      expect(classifyError(BusinessCode.AUTH_ERROR)).toBe(ErrorType.AUTH);
    });

    it('should classify code=403 as PERMISSION error', () => {
      expect(classifyError(BusinessCode.PERMISSION_ERROR)).toBe(ErrorType.PERMISSION);
    });

    it('should classify code=0 as GENERAL error', () => {
      expect(classifyError(BusinessCode.GENERAL_ERROR)).toBe(ErrorType.GENERAL);
    });

    it('should classify any other code as GENERAL error', () => {
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
  });


  describe('Property 2: Message Extraction', () => {
    /**
     * Property: For any API response with a non-empty message field,
     * the error notification SHALL display that exact message to the user.
     */
    it('should use provided message when non-empty', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
          fc.integer(),
          (message, code) => {
            const result = resolveErrorMessage(message, code);
            expect(result).toBe(message);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default message when message is empty', () => {
      expect(resolveErrorMessage('', BusinessCode.AUTH_ERROR)).toBe('认证失败，请重新登录');
      expect(resolveErrorMessage('', BusinessCode.PERMISSION_ERROR)).toBe('权限不足，无法访问该资源');
      expect(resolveErrorMessage('', BusinessCode.GENERAL_ERROR)).toBe('系统异常，请稍后重试');
    });

    it('should use default message when message is whitespace only', () => {
      const whitespaceStrings = ['   ', '\t\t', '\n\n', '\r\n', '  \t  ', '\n \t \r'];
      whitespaceStrings.forEach((whitespace) => {
        const result = resolveErrorMessage(whitespace, BusinessCode.GENERAL_ERROR);
        expect(result).toBe('系统异常，请稍后重试');
      });
    });

    it('should use default message when message is null or undefined', () => {
      expect(resolveErrorMessage(null, BusinessCode.AUTH_ERROR)).toBe('认证失败，请重新登录');
      expect(resolveErrorMessage(undefined, BusinessCode.AUTH_ERROR)).toBe('认证失败，请重新登录');
    });
  });


  describe('Property 3: Auth Error Token Cleanup', () => {
    /**
     * Property: For any 401 error response, the system SHALL clear all
     * stored authentication tokens from localStorage.
     */
    it('should clear tokens on 401 error', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorMessage) => {
          vi.clearAllMocks();

          handleAuthError(errorMessage, { redirectOnAuth: false });

          expect(TokenManager.clearTokens).toHaveBeenCalledTimes(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should clear tokens via handleBusinessError for code 401', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (errorMessage) => {
          vi.clearAllMocks();
          ErrorNotificationService.reset();

          handleBusinessError(
            { code: 401, message: errorMessage, data: null },
            { redirectOnAuth: false }
          );

          expect(TokenManager.clearTokens).toHaveBeenCalledTimes(1);
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('handleBusinessError', () => {
    it('should return shouldReject=false for success code', () => {
      const result = handleBusinessError({ code: 1, message: 'success', data: {} });
      expect(result.shouldReject).toBe(false);
      expect(result.handled).toBe(true);
    });

    it('should return shouldReject=true for error codes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(401, 403, 0, -1, 500, 404),
          fc.string(),
          (code, message) => {
            vi.clearAllMocks();
            ErrorNotificationService.reset();

            const result = handleBusinessError(
              { code, message, data: null },
              { redirectOnAuth: false }
            );

            expect(result.shouldReject).toBe(true);
            expect(result.handled).toBe(true);
            expect(result.error).toBeDefined();
            expect(result.error?.code).toBe(code);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
