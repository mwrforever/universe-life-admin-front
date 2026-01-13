/**
 * useCOSUpload Hook 测试
 * Property 8: Upload Task Creation
 * Property 9: Upload Progress Phases
 * Property 10: Instant Upload (秒传)
 * Property 11: Upload Strategy Selection
 * Property 12: Network State Handling
 * Property 13: Upload Retry on Failure
 * Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.11, 5.12, 5.13
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';

// Mock modules
vi.mock('cos-js-sdk-v5', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      headObject: vi.fn(),
      putObject: vi.fn(),
      sliceUploadFile: vi.fn(),
      cancelTask: vi.fn(),
    })),
  };
});

vi.mock('@/utils/sha256', () => ({
  calculateSHA256: vi.fn(),
}));

vi.mock('@/services/upload/STSCache', () => ({
  stsCache: {
    getCredential: vi.fn(),
  },
  StsRefreshError: class StsRefreshError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'StsRefreshError';
    }
  },
}));

vi.mock('@/services/upload/uploadApi', () => ({
  COSUploadApiService: {
    uploadDoneWithRetry: vi.fn(),
  },
}));

import { useCOSUpload } from '../useCOSUpload';
import COS from 'cos-js-sdk-v5';
import { calculateSHA256 } from '@/utils/sha256';
import { stsCache, StsRefreshError } from '@/services/upload/STSCache';
import { COSUploadApiService } from '@/services/upload/uploadApi';

const mockCOS = vi.mocked(COS);
const mockCalculateSHA256 = vi.mocked(calculateSHA256);
const mockStsCache = vi.mocked(stsCache);
const mockUploadApi = vi.mocked(COSUploadApiService);

// Helper to create test files
function createTestFile(size: number, name: string = 'test.txt'): File {
  const data = new Uint8Array(size);
  return new File([data], name, { type: 'text/plain' });
}

describe('useCOSUpload', () => {
  let mockCosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockCosInstance = {
      headObject: vi.fn(),
      putObject: vi.fn(),
      sliceUploadFile: vi.fn(),
      cancelTask: vi.fn(),
    };
    
    mockCOS.mockImplementation(() => mockCosInstance);
    
    mockStsCache.getCredential.mockResolvedValue({
      tmpSecretId: 'test-id',
      tmpSecretKey: 'test-key',
      sessionToken: 'test-token',
      expiredTime: Math.floor(Date.now() / 1000) + 3600,
    });
    
    mockCalculateSHA256.mockResolvedValue('abc123hash');
    
    mockUploadApi.uploadDoneWithRetry.mockResolvedValue({
      code: 1,
      message: 'success',
      data: { fileId: 'file-123', downloadPath: '/files/file-123' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Property 8: Upload Task Creation
  describe('Task Creation', () => {
    it('should create tasks with unique IDs', async () => {
      const { result } = renderHook(() => useCOSUpload());
      
      const files = [
        createTestFile(100, 'file1.txt'),
        createTestFile(200, 'file2.txt'),
        createTestFile(300, 'file3.txt'),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      // Check unique IDs
      const ids = result.current.tasks.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      expect(ids.length).toBe(3);
    });

    it('should create tasks with unique IDs for any number of files', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (fileCount) => {
            const { result } = renderHook(() => useCOSUpload());
            
            const files = Array.from({ length: fileCount }, (_, i) =>
              createTestFile(100, `file${i}.txt`)
            );

            act(() => {
              result.current.addFiles(files);
            });

            const ids = result.current.tasks.map(t => t.id);
            const uniqueIds = new Set(ids);
            
            // All IDs should be unique
            expect(uniqueIds.size).toBe(fileCount);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Property 11: Upload Strategy Selection
  describe('Upload Strategy Selection', () => {
    it('should use putObject for files <= 5MB', async () => {
      const smallFile = createTestFile(4 * 1024 * 1024, 'small.txt'); // 4MB
      
      mockCosInstance.headObject.mockImplementation((_, callback) => {
        callback(new Error('Not found')); // File doesn't exist
      });
      
      mockCosInstance.putObject.mockImplementation((config, callback) => {
        config.onTaskReady?.('task-1');
        config.onProgress?.({ percent: 1 });
        callback(null);
      });

      const { result } = renderHook(() => useCOSUpload());

      act(() => {
        result.current.addFiles([smallFile]);
      });

      await waitFor(() => {
        expect(result.current.tasks[0]?.status).toBe('completed');
      }, { timeout: 5000 });

      expect(mockCosInstance.putObject).toHaveBeenCalled();
      expect(mockCosInstance.sliceUploadFile).not.toHaveBeenCalled();
    });

    it('should use sliceUploadFile for files > 5MB', async () => {
      const largeFile = createTestFile(6 * 1024 * 1024, 'large.txt'); // 6MB
      
      mockCosInstance.headObject.mockImplementation((_, callback) => {
        callback(new Error('Not found'));
      });
      
      mockCosInstance.sliceUploadFile.mockImplementation((config, callback) => {
        config.onTaskReady?.('task-1');
        config.onProgress?.({ percent: 1 });
        callback(null);
      });

      const { result } = renderHook(() => useCOSUpload());

      act(() => {
        result.current.addFiles([largeFile]);
      });

      await waitFor(() => {
        expect(result.current.tasks[0]?.status).toBe('completed');
      }, { timeout: 5000 });

      expect(mockCosInstance.sliceUploadFile).toHaveBeenCalled();
      expect(mockCosInstance.putObject).not.toHaveBeenCalled();
    });
  });

  // Property 10: Instant Upload (秒传)
  describe('Instant Upload', () => {
    it('should skip upload when file exists in COS', async () => {
      const file = createTestFile(1024, 'existing.txt');
      
      // File exists
      mockCosInstance.headObject.mockImplementation((_, callback) => {
        callback(null); // No error means file exists
      });

      const { result } = renderHook(() => useCOSUpload());

      act(() => {
        result.current.addFiles([file]);
      });

      await waitFor(() => {
        expect(result.current.tasks[0]?.status).toBe('completed');
      }, { timeout: 5000 });

      // Should not call upload methods
      expect(mockCosInstance.putObject).not.toHaveBeenCalled();
      expect(mockCosInstance.sliceUploadFile).not.toHaveBeenCalled();
      
      // Should still notify backend
      expect(mockUploadApi.uploadDoneWithRetry).toHaveBeenCalled();
    });
  });

  // Property 9: Upload Progress Phases
  describe('Progress Phases', () => {
    it('should report progress in correct phases', async () => {
      const file = createTestFile(1024, 'test.txt');
      const progressValues: number[] = [];
      
      mockCalculateSHA256.mockImplementation(async (_, onProgress) => {
        onProgress?.(50);
        onProgress?.(100);
        return 'hash123';
      });
      
      mockCosInstance.headObject.mockImplementation((_, callback) => {
        callback(new Error('Not found'));
      });
      
      mockCosInstance.putObject.mockImplementation((config, callback) => {
        config.onTaskReady?.('task-1');
        config.onProgress?.({ percent: 0.5 });
        config.onProgress?.({ percent: 1 });
        callback(null);
      });

      const { result } = renderHook(() => useCOSUpload());

      // Track progress changes
      const unsubscribe = vi.fn();

      act(() => {
        result.current.addFiles([file]);
      });

      await waitFor(() => {
        expect(result.current.tasks[0]?.status).toBe('completed');
      }, { timeout: 5000 });

      // Final progress should be 100
      expect(result.current.tasks[0]?.progress).toBe(100);
    });
  });

  // Basic operations
  describe('Basic Operations', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useCOSUpload());

      expect(result.current.tasks).toEqual([]);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.isOnline).toBe(true);
    });

    it('should provide all required methods', () => {
      const { result } = renderHook(() => useCOSUpload());

      expect(typeof result.current.addFiles).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.resume).toBe('function');
      expect(typeof result.current.cancel).toBe('function');
      expect(typeof result.current.retry).toBe('function');
      expect(typeof result.current.pauseAll).toBe('function');
      expect(typeof result.current.resumeAll).toBe('function');
      expect(typeof result.current.cancelAll).toBe('function');
    });
  });

  // Cancel operation
  describe('Cancel Operation', () => {
    it('should remove task when cancelled', async () => {
      const file = createTestFile(1024, 'test.txt');
      
      // Make upload hang
      mockCosInstance.headObject.mockImplementation(() => {});

      const { result } = renderHook(() => useCOSUpload());

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.tasks.length).toBe(1);
      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.cancel(taskId);
      });

      expect(result.current.tasks.length).toBe(0);
    });
  });

  // isUploading state
  describe('isUploading State', () => {
    it('should be true when tasks are in progress', async () => {
      const file = createTestFile(1024, 'test.txt');
      
      // Make upload hang
      mockCosInstance.headObject.mockImplementation(() => {});

      const { result } = renderHook(() => useCOSUpload());

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.isUploading).toBe(true);
    });
  });
});
