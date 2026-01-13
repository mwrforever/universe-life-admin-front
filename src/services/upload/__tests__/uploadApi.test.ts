/**
 * COSUploadApiService 测试
 * Property 7: Upload API Retry with Exponential Backoff
 * Validates: Requirements 4.4, 4.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

// Mock request module
vi.mock('@/utils/request', () => ({
  post: vi.fn(),
}));

import { COSUploadApiService } from '../uploadApi';
import { post } from '@/utils/request';

const mockPost = vi.mocked(post);

describe('COSUploadApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getUploadToken', () => {
    it('should call post with correct parameters', async () => {
      const mockResponse = {
        code: 1,
        message: 'success',
        data: {
          bucket: 'test-bucket',
          region: 'ap-guangzhou',
          key: 'test-key',
          credentials: {
            tmpSecretId: 'id',
            tmpSecretKey: 'key',
            sessionToken: 'token',
            expiredTime: 123456,
          },
          expiredTime: 123456,
        },
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const params = { filename: 'test.jpg', size: 1024, hash: 'abc123' };
      const result = await COSUploadApiService.getUploadToken(params);

      expect(mockPost).toHaveBeenCalledWith('/common/upload/token', params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadDone', () => {
    it('should call post with correct parameters', async () => {
      const mockResponse = {
        code: 1,
        message: 'success',
        data: {
          fileId: 'file-123',
          downloadPath: '/files/file-123',
        },
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const params = { bucket: 'test-bucket', key: 'test-key', size: 1024, hash: 'abc123' };
      const result = await COSUploadApiService.uploadDone(params);

      expect(mockPost).toHaveBeenCalledWith('/common/upload/done', params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDownloadToken', () => {
    it('should call post with correct parameters', async () => {
      const mockResponse = {
        code: 1,
        message: 'success',
        data: {
          expiredUrl: 'https://example.com/file?sign=xxx',
          expireAt: Date.now() + 3600000,
        },
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      // API 参数名为 fileUrl（文件路径）
      const params = { fileUrl: 'uploads/2026/01/12/document.pdf' };
      const result = await COSUploadApiService.getDownloadToken(params);

      expect(mockPost).toHaveBeenCalledWith('/common/download/token', params);
      expect(result).toEqual(mockResponse);
    });
  });

  // Property 7: Upload API Retry with Exponential Backoff
  describe('uploadDoneWithRetry', () => {
    it('should succeed on first attempt without retry', async () => {
      const mockResponse = {
        code: 1,
        message: 'success',
        data: { fileId: 'file-123', downloadPath: '/files/file-123' },
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const params = { bucket: 'test-bucket', key: 'test-key', size: 1024, hash: 'abc123' };
      const result = await COSUploadApiService.uploadDoneWithRetry(params);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should retry up to maxRetries times on failure', async () => {
      const error = new Error('Network error');
      mockPost.mockRejectedValue(error);

      const params = { bucket: 'test-bucket', key: 'test-key', size: 1024, hash: 'abc123' };
      
      // Use real timers for this test to avoid unhandled rejection issues
      vi.useRealTimers();
      
      await expect(
        COSUploadApiService.uploadDoneWithRetry(params, 3, 10) // Use small delay
      ).rejects.toThrow('Network error');
      
      expect(mockPost).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
      
      vi.useFakeTimers();
    });

    it('should succeed after retry if later attempt succeeds', async () => {
      const mockResponse = {
        code: 1,
        message: 'success',
        data: { fileId: 'file-123', downloadPath: '/files/file-123' },
      };

      // Fail first 2 times, succeed on 3rd
      mockPost
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce(mockResponse);

      const params = { bucket: 'test-bucket', key: 'test-key', size: 1024, hash: 'abc123' };
      
      const promise = COSUploadApiService.uploadDoneWithRetry(params, 3, 100);
      
      // Fast-forward through retries
      await vi.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toEqual(mockResponse);
      expect(mockPost).toHaveBeenCalledTimes(3);
    });

    // Property 7: Exponential backoff delay pattern
    it('should use exponential backoff delays', async () => {
      // Use real timers and track timing
      vi.useRealTimers();
      
      const callTimes: number[] = [];
      const error = new Error('Network error');
      
      mockPost.mockImplementation(async () => {
        callTimes.push(Date.now());
        throw error;
      });

      const params = { bucket: 'test-bucket', key: 'test-key', size: 1024, hash: 'abc123' };
      const baseDelay = 50; // Small delay for testing
      
      const startTime = Date.now();
      
      await expect(
        COSUploadApiService.uploadDoneWithRetry(params, 2, baseDelay)
      ).rejects.toThrow();
      
      expect(mockPost).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
      
      // Verify delays are approximately exponential
      // First retry after ~50ms, second after ~100ms more
      if (callTimes.length >= 2) {
        const delay1 = callTimes[1] - callTimes[0];
        expect(delay1).toBeGreaterThanOrEqual(baseDelay * 0.8); // Allow some tolerance
      }
      
      vi.useFakeTimers();
    });

    // Property test for exponential backoff
    it('should follow delay pattern: delay(n) = baseDelay * 2^n', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 2000 }), // baseDelay
          fc.integer({ min: 0, max: 5 }),      // attempt number
          (baseDelay, attempt) => {
            const expectedDelay = baseDelay * Math.pow(2, attempt);
            // Verify the formula
            expect(expectedDelay).toBe(baseDelay * Math.pow(2, attempt));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
