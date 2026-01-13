/**
 * 路由工具函数测试
 * 
 * 包含单元测试和属性测试
 * 
 * @author James
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getPageKeyFromPath,
  getPathFromPageKey,
  isValidPath,
  isValidKey,
  getDefaultPath,
  getDefaultKey,
  getPageKeyFromPathOrDefault,
  getPathFromPageKeyOrDefault,
} from './routeUtils';
import {
  routeConfig,
  DEFAULT_PATH,
  DEFAULT_KEY,
} from '../routes/routeConfig';

// 获取所有有效的路径和 key
const validPaths = routeConfig.map(r => r.path);
const validKeys = routeConfig.map(r => r.key);

describe('routeUtils', () => {
  // ============== 单元测试 ==============
  
  describe('getPageKeyFromPath', () => {
    it('should return correct key for valid paths', () => {
      expect(getPageKeyFromPath('/dashboard')).toBe('dashboard');
      expect(getPageKeyFromPath('/system/user')).toBe('system-user');
      expect(getPageKeyFromPath('/system/role')).toBe('system-role');
    });

    it('should return null for invalid paths', () => {
      expect(getPageKeyFromPath('/invalid')).toBeNull();
      expect(getPageKeyFromPath('/system/invalid')).toBeNull();
      expect(getPageKeyFromPath('')).toBeNull();
    });

    it('should handle null and undefined', () => {
      expect(getPageKeyFromPath(null as any)).toBeNull();
      expect(getPageKeyFromPath(undefined as any)).toBeNull();
    });

    it('should handle paths with trailing slash', () => {
      expect(getPageKeyFromPath('/dashboard/')).toBe('dashboard');
      expect(getPageKeyFromPath('/system/user/')).toBe('system-user');
    });
  });

  describe('getPathFromPageKey', () => {
    it('should return correct path for valid keys', () => {
      expect(getPathFromPageKey('dashboard')).toBe('/dashboard');
      expect(getPathFromPageKey('system-user')).toBe('/system/user');
      expect(getPathFromPageKey('system-role')).toBe('/system/role');
    });

    it('should return null for invalid keys', () => {
      expect(getPathFromPageKey('invalid')).toBeNull();
      expect(getPathFromPageKey('')).toBeNull();
    });

    it('should handle null and undefined', () => {
      expect(getPathFromPageKey(null as any)).toBeNull();
      expect(getPathFromPageKey(undefined as any)).toBeNull();
    });
  });

  describe('isValidPath', () => {
    it('should return true for valid paths', () => {
      expect(isValidPath('/dashboard')).toBe(true);
      expect(isValidPath('/system/user')).toBe(true);
    });

    it('should return false for invalid paths', () => {
      expect(isValidPath('/invalid')).toBe(false);
      expect(isValidPath('')).toBe(false);
    });

    it('should handle paths with trailing slash', () => {
      expect(isValidPath('/dashboard/')).toBe(true);
    });
  });

  describe('isValidKey', () => {
    it('should return true for valid keys', () => {
      expect(isValidKey('dashboard')).toBe(true);
      expect(isValidKey('system-user')).toBe(true);
    });

    it('should return false for invalid keys', () => {
      expect(isValidKey('invalid')).toBe(false);
      expect(isValidKey('')).toBe(false);
    });
  });

  describe('getDefaultPath and getDefaultKey', () => {
    it('should return default values', () => {
      expect(getDefaultPath()).toBe(DEFAULT_PATH);
      expect(getDefaultKey()).toBe(DEFAULT_KEY);
    });
  });

  describe('getPageKeyFromPathOrDefault', () => {
    it('should return key for valid path', () => {
      expect(getPageKeyFromPathOrDefault('/dashboard')).toBe('dashboard');
    });

    it('should return default key for invalid path', () => {
      expect(getPageKeyFromPathOrDefault('/invalid')).toBe(DEFAULT_KEY);
    });
  });

  describe('getPathFromPageKeyOrDefault', () => {
    it('should return path for valid key', () => {
      expect(getPathFromPageKeyOrDefault('dashboard')).toBe('/dashboard');
    });

    it('should return default path for invalid key', () => {
      expect(getPathFromPageKeyOrDefault('invalid')).toBe(DEFAULT_PATH);
    });
  });

  // ============== 属性测试 ==============
  
  /**
   * Feature: route-persistence, Property 1: URL 与页面 Key 的双向映射一致性
   * 
   * *For any* 有效的页面 key，通过 getPathFromPageKey 获取路径后，
   * 再通过 getPageKeyFromPath 应该返回原始的 key。
   * 
   * **Validates: Requirements 1.1, 1.2**
   */
  describe('Property 1: Bidirectional mapping consistency', () => {
    it('should maintain consistency: key -> path -> key', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validKeys),
          (key) => {
            const path = getPathFromPageKey(key);
            expect(path).not.toBeNull();
            const resultKey = getPageKeyFromPath(path!);
            expect(resultKey).toBe(key);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistency: path -> key -> path', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...validPaths),
          (path) => {
            const key = getPageKeyFromPath(path);
            expect(key).not.toBeNull();
            const resultPath = getPathFromPageKey(key!);
            expect(resultPath).toBe(path);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: route-persistence, Property 3: 无效路径重定向
   * 
   * *For any* 无效的页面路径，isValidPath 应该返回 false，
   * getPageKeyFromPath 应该返回 null。
   * 
   * **Validates: Requirements 1.3, 2.3**
   */
  describe('Property 3: Invalid path handling', () => {
    // 生成不在有效路径列表中的随机路径
    const invalidPathArbitrary = fc.string().filter(s => !validPaths.includes(s) && !validPaths.includes(s.replace(/\/$/, '')));

    it('should return null for invalid paths', () => {
      fc.assert(
        fc.property(
          invalidPathArbitrary,
          (path) => {
            const key = getPageKeyFromPath(path);
            expect(key).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for invalid paths in isValidPath', () => {
      fc.assert(
        fc.property(
          invalidPathArbitrary,
          (path) => {
            expect(isValidPath(path)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return default key for invalid paths in getPageKeyFromPathOrDefault', () => {
      fc.assert(
        fc.property(
          invalidPathArbitrary,
          (path) => {
            const key = getPageKeyFromPathOrDefault(path);
            expect(key).toBe(DEFAULT_KEY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 边界情况测试
   */
  describe('Edge cases', () => {
    it('should handle special characters in paths', () => {
      expect(getPageKeyFromPath('/dashboard?query=1')).toBeNull();
      expect(getPageKeyFromPath('/dashboard#hash')).toBeNull();
    });

    it('should handle empty and whitespace strings', () => {
      expect(getPageKeyFromPath('')).toBeNull();
      expect(getPageKeyFromPath('   ')).toBeNull();
      expect(getPathFromPageKey('')).toBeNull();
      expect(getPathFromPageKey('   ')).toBeNull();
    });
  });
});
