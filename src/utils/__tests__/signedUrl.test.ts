/**
 * 签名链接管理工具函数属性测试
 * 
 * Property 1: 签名处理完整性
 * Property 2: 签名跳过条件
 * Property 3: 签名链接按需过期检测
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 3.2**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  needsSignedUrl,
  isSignedUrlExpired,
  updateSignedUrlCache,
  getOriginalKey,
  clearAllSignedUrlCache,
  getCachedSignedUrl,
} from '../signedUrl';

describe('签名链接管理工具函数', () => {
  beforeEach(() => {
    // 每个测试前清除缓存
    clearAllSignedUrlCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 2: 签名跳过条件
   * *For any* avatarUrl 字段，如果值为空、以 blob: 开头、或以 http:// 或 https:// 开头，
   * 则签名处理应该跳过该字段，保持原值不变。
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: 签名跳过条件', () => {
    // 生成空值
    const emptyValueArb = fc.constantFrom('', null, undefined) as fc.Arbitrary<string>;

    // 生成 blob URL
    const blobUrlArb = fc.string({ minLength: 1, maxLength: 50 })
      .map(s => `blob:${s}`);

    // 生成完整的 http URL
    const httpUrlArb = fc.webUrl({ validSchemes: ['http'] });

    // 生成完整的 https URL
    const httpsUrlArb = fc.webUrl({ validSchemes: ['https'] });

    it('空值不需要签名', () => {
      fc.assert(
        fc.property(emptyValueArb, (value) => {
          // Feature: user-edit-flow-optimization, Property 2: 签名跳过条件
          expect(needsSignedUrl(value as string)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('blob URL 不需要签名', () => {
      fc.assert(
        fc.property(blobUrlArb, (url) => {
          // Feature: user-edit-flow-optimization, Property 2: 签名跳过条件
          expect(needsSignedUrl(url)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('http URL 不需要签名', () => {
      fc.assert(
        fc.property(httpUrlArb, (url) => {
          // Feature: user-edit-flow-optimization, Property 2: 签名跳过条件
          expect(needsSignedUrl(url)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('https URL 不需要签名', () => {
      fc.assert(
        fc.property(httpsUrlArb, (url) => {
          // Feature: user-edit-flow-optimization, Property 2: 签名跳过条件
          expect(needsSignedUrl(url)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Property 1: 签名处理完整性
   * *For any* 用户列表数据，如果 avatarUrl 是相对路径（非空、非 blob、非 http/https 开头），
   * 则签名处理后该字段应该被替换为带签名的完整 URL，且签名 URL 应该被缓存。
   * **Validates: Requirements 1.1, 1.3, 1.4**
   */
  describe('Property 1: 签名处理完整性', () => {
    // 生成相对路径（需要签名的路径）
    const relativePathArb = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => 
        !s.startsWith('blob:') && 
        !s.startsWith('http://') && 
        !s.startsWith('https://') &&
        s.trim().length > 0
      )
      .map(s => `uploads/${s.replace(/[^a-zA-Z0-9]/g, '')}/avatar.jpg`);

    it('相对路径需要签名', () => {
      fc.assert(
        fc.property(relativePathArb, (path) => {
          // Feature: user-edit-flow-optimization, Property 1: 签名处理完整性
          expect(needsSignedUrl(path)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('签名后的 URL 应该被正确缓存', () => {
      // 生成签名 URL 和过期时间
      const signedUrlArb = fc.webUrl({ validSchemes: ['https'] });
      const expireAtArb = fc.integer({ min: Math.floor(Date.now() / 1000) + 120, max: Math.floor(Date.now() / 1000) + 3600 });

      fc.assert(
        fc.property(relativePathArb, signedUrlArb, expireAtArb, (originalKey, signedUrl, expireAt) => {
          // Feature: user-edit-flow-optimization, Property 1: 签名处理完整性
          // 更新缓存
          updateSignedUrlCache(originalKey, signedUrl, expireAt);
          
          // 验证缓存
          const cached = getCachedSignedUrl(originalKey);
          expect(cached).toBeDefined();
          expect(cached?.url).toBe(signedUrl);
          expect(cached?.expireAt).toBe(expireAt);
          expect(cached?.originalKey).toBe(originalKey);
        }),
        { numRuns: 100 }
      );
    });

    it('可以从缓存中获取原始 key', () => {
      const signedUrlArb = fc.webUrl({ validSchemes: ['https'] });
      const expireAtArb = fc.integer({ min: Math.floor(Date.now() / 1000) + 120, max: Math.floor(Date.now() / 1000) + 3600 });

      fc.assert(
        fc.property(relativePathArb, signedUrlArb, expireAtArb, (originalKey, signedUrl, expireAt) => {
          // Feature: user-edit-flow-optimization, Property 1: 签名处理完整性
          // 更新缓存
          updateSignedUrlCache(originalKey, signedUrl, expireAt);
          
          // 从签名 URL 获取原始 key
          const retrievedKey = getOriginalKey(signedUrl);
          expect(retrievedKey).toBe(originalKey);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: 签名链接按需过期检测
   * *For any* 已缓存的签名链接，当使用该链接时进行过期检查：
   * 如果当前时间距离过期时间小于 60 秒，则应该被判定为过期。
   * **Validates: Requirements 3.2**
   */
  describe('Property 3: 签名链接按需过期检测', () => {
    const relativePathArb = fc.string({ minLength: 1, maxLength: 50 })
      .filter(s => s.trim().length > 0)
      .map(s => `uploads/${s.replace(/[^a-zA-Z0-9]/g, '')}/file.jpg`);
    
    const signedUrlArb = fc.webUrl({ validSchemes: ['https'] });

    it('未缓存的 URL 应该被判定为过期', () => {
      fc.assert(
        fc.property(relativePathArb, (path) => {
          // Feature: user-edit-flow-optimization, Property 3: 签名链接按需过期检测
          // 确保缓存为空
          clearAllSignedUrlCache();
          expect(isSignedUrlExpired(path)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('过期时间在 60 秒内的缓存应该被判定为过期', () => {
      // 生成 0-59 秒后过期的时间
      const expireWithinBufferArb = fc.integer({ min: 0, max: 59 })
        .map(seconds => Math.floor(Date.now() / 1000) + seconds);

      fc.assert(
        fc.property(relativePathArb, signedUrlArb, expireWithinBufferArb, (originalKey, signedUrl, expireAt) => {
          // Feature: user-edit-flow-optimization, Property 3: 签名链接按需过期检测
          clearAllSignedUrlCache();
          updateSignedUrlCache(originalKey, signedUrl, expireAt);
          expect(isSignedUrlExpired(originalKey)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('过期时间超过 60 秒的缓存应该被判定为有效', () => {
      // 生成 61-3600 秒后过期的时间
      const expireAfterBufferArb = fc.integer({ min: 61, max: 3600 })
        .map(seconds => Math.floor(Date.now() / 1000) + seconds);

      fc.assert(
        fc.property(relativePathArb, signedUrlArb, expireAfterBufferArb, (originalKey, signedUrl, expireAt) => {
          // Feature: user-edit-flow-optimization, Property 3: 签名链接按需过期检测
          clearAllSignedUrlCache();
          updateSignedUrlCache(originalKey, signedUrl, expireAt);
          expect(isSignedUrlExpired(originalKey)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('已过期的缓存应该被判定为过期', () => {
      // 生成已经过期的时间（过去 1-3600 秒）
      const alreadyExpiredArb = fc.integer({ min: 1, max: 3600 })
        .map(seconds => Math.floor(Date.now() / 1000) - seconds);

      fc.assert(
        fc.property(relativePathArb, signedUrlArb, alreadyExpiredArb, (originalKey, signedUrl, expireAt) => {
          // Feature: user-edit-flow-optimization, Property 3: 签名链接按需过期检测
          clearAllSignedUrlCache();
          updateSignedUrlCache(originalKey, signedUrl, expireAt);
          expect(isSignedUrlExpired(originalKey)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * 边界条件测试
   */
  describe('边界条件测试', () => {
    it('getOriginalKey 对于非 URL 字符串应该直接返回原值', () => {
      const nonUrlArb = fc.string({ minLength: 1, maxLength: 100 })
        .filter(s => !s.startsWith('http://') && !s.startsWith('https://'));

      fc.assert(
        fc.property(nonUrlArb, (value) => {
          expect(getOriginalKey(value)).toBe(value);
        }),
        { numRuns: 100 }
      );
    });

    it('getOriginalKey 对于未缓存的 URL 应该返回原值', () => {
      const urlArb = fc.webUrl({ validSchemes: ['https'] });

      fc.assert(
        fc.property(urlArb, (url) => {
          clearAllSignedUrlCache();
          expect(getOriginalKey(url)).toBe(url);
        }),
        { numRuns: 100 }
      );
    });
  });
});
