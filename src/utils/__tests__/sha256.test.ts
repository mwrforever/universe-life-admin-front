/**
 * SHA-256 哈希计算工具测试
 * Property 5: SHA-256 Hash Correctness
 * Property 6: SHA-256 Progress Reporting
 * Validates: Requirements 3.1, 3.3, 3.4
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { calculateSHA256 } from '../sha256';

// 创建测试用的 File 对象，兼容 jsdom 环境
function createTestFile(data: Uint8Array, name: string = 'test.bin'): File {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  // 在 jsdom 环境中，File 可能没有 arrayBuffer 方法，需要从 Blob 继承
  const file = new File([blob], name, { type: 'application/octet-stream' });
  
  // 如果 arrayBuffer 不存在，手动添加
  if (!file.arrayBuffer) {
    (file as any).arrayBuffer = async () => {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
      });
    };
  }
  
  // 确保 slice 返回的 Blob 也有 arrayBuffer 方法
  const originalSlice = file.slice.bind(file);
  (file as any).slice = (start?: number, end?: number, contentType?: string) => {
    const slicedBlob = originalSlice(start, end, contentType);
    if (!slicedBlob.arrayBuffer) {
      (slicedBlob as any).arrayBuffer = async () => {
        return new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(slicedBlob);
        });
      };
    }
    return slicedBlob;
  };
  
  return file;
}

describe('calculateSHA256', () => {
  // Property 5: SHA-256 Hash Correctness
  it('should return 64-character lowercase hex string for any file', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 10000 }),
        async (data) => {
          const file = createTestFile(data);
          const hash = await calculateSHA256(file);
          
          // Should be exactly 64 characters
          expect(hash.length).toBe(64);
          // Should be lowercase hex
          expect(hash).toMatch(/^[0-9a-f]{64}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 5: Same input should produce same hash
  it('should produce consistent hash for same content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        async (data) => {
          const file1 = createTestFile(data);
          const file2 = createTestFile(data);
          
          const hash1 = await calculateSHA256(file1);
          const hash2 = await calculateSHA256(file2);
          
          expect(hash1).toBe(hash2);
        }
      ),
      { numRuns: 50 }
    );
  });

  // Property 6: SHA-256 Progress Reporting
  it('should call progress callback with values from 0 to 100', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 100, maxLength: 5000 }),
        async (data) => {
          const file = createTestFile(data);
          const progressValues: number[] = [];
          
          await calculateSHA256(file, (progress) => {
            progressValues.push(progress);
          });
          
          // Should have at least one progress value
          expect(progressValues.length).toBeGreaterThan(0);
          // All values should be between 0 and 100
          progressValues.forEach(p => {
            expect(p).toBeGreaterThanOrEqual(0);
            expect(p).toBeLessThanOrEqual(100);
          });
          // Last value should be 100
          expect(progressValues[progressValues.length - 1]).toBe(100);
        }
      ),
      { numRuns: 50 }
    );
  });

  // Property 6: Progress should be monotonically increasing
  it('should report progress monotonically increasing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 100, maxLength: 5000 }),
        async (data) => {
          const file = createTestFile(data);
          const progressValues: number[] = [];
          
          await calculateSHA256(file, (progress) => {
            progressValues.push(progress);
          });
          
          // Progress should be monotonically increasing
          for (let i = 1; i < progressValues.length; i++) {
            expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  // Known test vectors
  it('should produce correct hash for known inputs', async () => {
    // Empty string SHA-256
    const emptyFile = createTestFile(new Uint8Array(0));
    const emptyHash = await calculateSHA256(emptyFile);
    expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    // "hello" SHA-256
    const helloData = new TextEncoder().encode('hello');
    const helloFile = createTestFile(helloData);
    const helloHash = await calculateSHA256(helloFile);
    expect(helloHash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('should handle empty file', async () => {
    const emptyFile = createTestFile(new Uint8Array(0));
    const hash = await calculateSHA256(emptyFile);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle large files with chunking', async () => {
    // Create a file larger than default chunk size (2MB)
    const largeData = new Uint8Array(3 * 1024 * 1024); // 3MB
    for (let i = 0; i < largeData.length; i++) {
      largeData[i] = i % 256;
    }
    const largeFile = createTestFile(largeData);
    
    const progressCallback = vi.fn();
    const hash = await calculateSHA256(largeFile, progressCallback);
    
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(progressCallback).toHaveBeenCalled();
  });
});
