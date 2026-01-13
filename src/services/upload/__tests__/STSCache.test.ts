/**
 * STSCache 服务测试
 * Property 1: STS Cache Singleton Pattern
 * Property 2: STS Cache Credential Caching
 * Property 3: STS Cache Auto-Refresh
 * Property 4: STS Cache Request Deduplication
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// Mock request module
vi.mock('@/utils/request', () => ({
  post: vi.fn(),
}));

import { stsCache, StsRefreshError } from '../STSCache';
import { post } from '@/utils/request';

const mockPost = vi.mocked(post);

describe('STSCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stsCache.clearAllCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Property 1: STS Cache Singleton Pattern
  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple imports', async () => {
      // 动态导入两次
      const { stsCache: cache1 } = await import('../STSCache');
      const { stsCache: cache2 } = await import('../STSCache');
      
      expect(cache1).toBe(cache2);
    });
  });

  // Property 2: STS Cache Credential Caching
  describe('Credential Caching', () => {
    it('should cache credentials and return cached value without new request', async () => {
      const mockCredential = {
        tmpSecretId: 'test-id',
        tmpSecretKey: 'test-key',
        sessionToken: 'test-token',
        expiredTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      mockPost.mockResolvedValueOnce({
        code: 1,
        message: 'success',
        data: {
          bucket: 'test-bucket',
          region: 'ap-guangzhou',
          key: 'test-key',
          credentials: mockCredential,
          expiredTime: mockCredential.expiredTime,
        },
      });

      // First call - should fetch from server
      const result1 = await stsCache.getCredential('test-bucket', 'ap-guangzhou');
      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockCredential);

      // Second call - should return cached value
      const result2 = await stsCache.getCredential('test-bucket', 'ap-guangzhou');
      expect(mockPost).toHaveBeenCalledTimes(1); // Still 1, no new request
      expect(result2).toEqual(mockCredential);
    });

    it('should cache credentials by bucket and region combination', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (bucket, region) => {
            stsCache.clearAllCache();
            mockPost.mockClear();

            const mockCredential = {
              tmpSecretId: `id-${bucket}-${region}`,
              tmpSecretKey: 'test-key',
              sessionToken: 'test-token',
              expiredTime: Math.floor(Date.now() / 1000) + 3600,
            };

            mockPost.mockResolvedValue({
              code: 1,
              message: 'success',
              data: {
                bucket,
                region,
                key: 'test-key',
                credentials: mockCredential,
                expiredTime: mockCredential.expiredTime,
              },
            });

            // First call
            await stsCache.getCredential(bucket, region);
            const callCount1 = mockPost.mock.calls.length;

            // Second call with same bucket/region
            await stsCache.getCredential(bucket, region);
            const callCount2 = mockPost.mock.calls.length;

            // Should not make additional request
            expect(callCount2).toBe(callCount1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Property 3: STS Cache Auto-Refresh
  describe('Auto-Refresh', () => {
    it('should return true for needsRefresh when expiration < 30 seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 29999 }), // 0-29.999 seconds
          (remainingMs) => {
            const entry = {
              credential: {
                tmpSecretId: 'test',
                tmpSecretKey: 'test',
                sessionToken: 'test',
                expiredTime: 0,
              },
              expireAt: Date.now() + remainingMs,
            };
            
            expect(stsCache.needsRefresh(entry)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for needsRefresh when expiration >= 30 seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 30000, max: 3600000 }), // 30 seconds to 1 hour
          (remainingMs) => {
            const entry = {
              credential: {
                tmpSecretId: 'test',
                tmpSecretKey: 'test',
                sessionToken: 'test',
                expiredTime: 0,
              },
              expireAt: Date.now() + remainingMs,
            };
            
            expect(stsCache.needsRefresh(entry)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return true for needsRefresh when entry is undefined', () => {
      expect(stsCache.needsRefresh(undefined)).toBe(true);
    });
  });

  // Property 4: STS Cache Request Deduplication
  describe('Request Deduplication', () => {
    it('should deduplicate concurrent requests for same bucket/region', async () => {
      const mockCredential = {
        tmpSecretId: 'test-id',
        tmpSecretKey: 'test-key',
        sessionToken: 'test-token',
        expiredTime: Math.floor(Date.now() / 1000) + 3600,
      };

      // Simulate slow network request
      mockPost.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            code: 1,
            message: 'success',
            data: {
              bucket: 'test-bucket',
              region: 'ap-guangzhou',
              key: 'test-key',
              credentials: mockCredential,
              expiredTime: mockCredential.expiredTime,
            },
          }), 100)
        )
      );

      // Make multiple concurrent requests
      const promises = [
        stsCache.getCredential('test-bucket', 'ap-guangzhou'),
        stsCache.getCredential('test-bucket', 'ap-guangzhou'),
        stsCache.getCredential('test-bucket', 'ap-guangzhou'),
      ];

      const results = await Promise.all(promises);

      // Should only make one request
      expect(mockPost).toHaveBeenCalledTimes(1);
      
      // All results should be the same
      results.forEach(result => {
        expect(result).toEqual(mockCredential);
      });
    });
  });

  // Error handling
  describe('Error Handling', () => {
    it('should throw StsRefreshError when fetch fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        stsCache.getCredential('test-bucket', 'ap-guangzhou')
      ).rejects.toThrow(StsRefreshError);
    });

    it('should include original error as cause', async () => {
      const originalError = new Error('Network error');
      mockPost.mockRejectedValueOnce(originalError);

      try {
        await stsCache.getCredential('test-bucket', 'ap-guangzhou');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StsRefreshError);
        expect((error as StsRefreshError).cause).toBe(originalError);
      }
    });
  });

  // Cache management
  describe('Cache Management', () => {
    it('should clear specific cache', async () => {
      const mockCredential = {
        tmpSecretId: 'test-id',
        tmpSecretKey: 'test-key',
        sessionToken: 'test-token',
        expiredTime: Math.floor(Date.now() / 1000) + 3600,
      };

      mockPost.mockResolvedValue({
        code: 1,
        message: 'success',
        data: {
          bucket: 'test-bucket',
          region: 'ap-guangzhou',
          key: 'test-key',
          credentials: mockCredential,
          expiredTime: mockCredential.expiredTime,
        },
      });

      // Populate cache
      await stsCache.getCredential('test-bucket', 'ap-guangzhou');
      expect(mockPost).toHaveBeenCalledTimes(1);

      // Clear specific cache
      stsCache.clearCache('test-bucket', 'ap-guangzhou');

      // Should fetch again
      await stsCache.getCredential('test-bucket', 'ap-guangzhou');
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache', async () => {
      const mockCredential = {
        tmpSecretId: 'test-id',
        tmpSecretKey: 'test-key',
        sessionToken: 'test-token',
        expiredTime: Math.floor(Date.now() / 1000) + 3600,
      };

      mockPost.mockResolvedValue({
        code: 1,
        message: 'success',
        data: {
          bucket: 'test-bucket',
          region: 'ap-guangzhou',
          key: 'test-key',
          credentials: mockCredential,
          expiredTime: mockCredential.expiredTime,
        },
      });

      // Populate cache
      await stsCache.getCredential('bucket1', 'region1');
      await stsCache.getCredential('bucket2', 'region2');
      expect(mockPost).toHaveBeenCalledTimes(2);

      // Clear all cache
      stsCache.clearAllCache();

      // Should fetch again for both
      await stsCache.getCredential('bucket1', 'region1');
      await stsCache.getCredential('bucket2', 'region2');
      expect(mockPost).toHaveBeenCalledTimes(4);
    });
  });
});
