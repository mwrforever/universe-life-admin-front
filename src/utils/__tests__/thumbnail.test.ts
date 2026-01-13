/**
 * 缩略图工具函数测试
 * 包含属性测试和单元测试
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isImageFile,
  isImageByExtension,
  isImage,
  validateImageFile,
  generateThumbnailUrl,
  generateThumbnailUrls,
  getFileIcon,
  getFileIconByName,
  IMAGE_MIME_TYPES,
  IMAGE_EXTENSIONS,
  THUMBNAIL_SIZES,
  DEFAULT_MAX_IMAGE_SIZE,
} from '../thumbnail';

// ========== Property Tests ==========

describe('Property Tests', () => {
  /**
   * Property 1: File Validation
   * For any file input, the validation function should correctly identify
   * whether the file is a valid image based on its MIME type and size constraints.
   * Validates: Requirements 1.1, 1.2
   */
  describe('Property 1: File Validation', () => {
    // 生成有效图片 MIME 类型
    const validImageMimeType = fc.constantFrom(...IMAGE_MIME_TYPES);
    
    // 生成无效 MIME 类型
    const invalidMimeType = fc.string().filter(
      s => !IMAGE_MIME_TYPES.includes(s as any) && s.length > 0
    );

    it('should accept all valid image MIME types', () => {
      fc.assert(
        fc.property(validImageMimeType, (mimeType) => {
          expect(isImageFile(mimeType)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid MIME types', () => {
      fc.assert(
        fc.property(invalidMimeType, (mimeType) => {
          expect(isImageFile(mimeType)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should validate file size correctly', () => {
      // 生成文件大小和最大限制
      const fileSizeArb = fc.nat({ max: 100 * 1024 * 1024 }); // 0-100MB
      const maxSizeArb = fc.nat({ max: 50 * 1024 * 1024 }).filter(s => s > 0); // 1-50MB

      fc.assert(
        fc.property(
          fileSizeArb,
          maxSizeArb,
          validImageMimeType,
          (fileSize, maxSize, mimeType) => {
            const mockFile = {
              size: fileSize,
              type: mimeType,
              name: 'test.jpg',
            } as File;

            const result = validateImageFile(mockFile, { maxSize });

            if (fileSize <= maxSize) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
              expect(result.error).toContain('不能超过');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject files with invalid types regardless of size', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1024 * 1024 }), // 小于 1MB
          invalidMimeType,
          (fileSize, mimeType) => {
            const mockFile = {
              size: fileSize,
              type: mimeType,
              name: 'test.txt',
            } as File;

            const result = validateImageFile(mockFile);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('只支持');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Thumbnail URL Generation
   * For any valid image URL and thumbnail size configuration,
   * the generated thumbnail URL should contain the correct size parameters
   * and be a valid URL format.
   * Validates: Requirements 3.1, 3.6
   */
  describe('Property 2: Thumbnail URL Generation', () => {
    // 生成有效的 URL
    const validUrlArb = fc.webUrl();
    
    // 生成缩略图尺寸
    const thumbnailSizeArb = fc.constantFrom('small', 'medium', 'large') as fc.Arbitrary<'small' | 'medium' | 'large'>;
    const numericSizeArb = fc.integer({ min: 1, max: 1000 });

    it('should generate URL with correct size parameter for named sizes', () => {
      fc.assert(
        fc.property(validUrlArb, thumbnailSizeArb, (url, size) => {
          const result = generateThumbnailUrl(url, size);
          const expectedSize = THUMBNAIL_SIZES[size];
          
          // 结果应包含原 URL
          expect(result).toContain(url.split('?')[0]);
          // 结果应包含 imageMogr2 参数
          expect(result).toContain('imageMogr2');
          // 结果应包含正确的尺寸
          expect(result).toContain(`thumbnail/${expectedSize}x${expectedSize}`);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate URL with correct size parameter for numeric sizes', () => {
      fc.assert(
        fc.property(validUrlArb, numericSizeArb, (url, size) => {
          const result = generateThumbnailUrl(url, size);
          
          // 结果应包含 imageMogr2 参数
          expect(result).toContain('imageMogr2');
          // 结果应包含正确的尺寸
          expect(result).toContain(`thumbnail/${size}x${size}`);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle URLs with existing query parameters', () => {
      const urlWithQueryArb = fc.webUrl().map(url => `${url}?token=abc123`);

      fc.assert(
        fc.property(urlWithQueryArb, thumbnailSizeArb, (url, size) => {
          const result = generateThumbnailUrl(url, size);
          
          // 应使用 & 连接参数
          expect(result).toContain('&imageMogr2');
          // 不应有重复的 ?
          const questionMarkCount = (result.match(/\?/g) || []).length;
          expect(questionMarkCount).toBe(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should not duplicate imageMogr2 parameter', () => {
      const urlWithImageMogrArb = fc.webUrl().map(
        url => `${url}?imageMogr2/thumbnail/100x100`
      );

      fc.assert(
        fc.property(urlWithImageMogrArb, thumbnailSizeArb, (url, size) => {
          const result = generateThumbnailUrl(url, size);
          
          // 应返回原 URL，不添加新参数
          expect(result).toBe(url);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate all thumbnail sizes correctly', () => {
      fc.assert(
        fc.property(validUrlArb, (url) => {
          const result = generateThumbnailUrls(url);
          
          // 应包含所有尺寸
          expect(result).toHaveProperty('small');
          expect(result).toHaveProperty('medium');
          expect(result).toHaveProperty('large');
          
          // 每个尺寸应包含正确的参数
          expect(result.small).toContain(`${THUMBNAIL_SIZES.small}x${THUMBNAIL_SIZES.small}`);
          expect(result.medium).toContain(`${THUMBNAIL_SIZES.medium}x${THUMBNAIL_SIZES.medium}`);
          expect(result.large).toContain(`${THUMBNAIL_SIZES.large}x${THUMBNAIL_SIZES.large}`);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: File Type Display Logic
   * For any file with a known MIME type, the File_Display component
   * should correctly determine whether to show an image thumbnail or a file type icon.
   * Validates: Requirements 6.1, 6.2
   */
  describe('Property 3: File Type Display Logic', () => {
    const validImageMimeType = fc.constantFrom(...IMAGE_MIME_TYPES);
    const nonImageMimeType = fc.constantFrom(
      'application/pdf',
      'application/msword',
      'application/zip',
      'text/plain',
      'audio/mpeg',
      'video/mp4'
    );

    it('should return file-image icon for all image MIME types', () => {
      fc.assert(
        fc.property(validImageMimeType, (mimeType) => {
          const icon = getFileIcon(mimeType);
          expect(icon).toBe('file-image');
        }),
        { numRuns: 100 }
      );
    });

    it('should return non-image icon for non-image MIME types', () => {
      fc.assert(
        fc.property(nonImageMimeType, (mimeType) => {
          const icon = getFileIcon(mimeType);
          expect(icon).not.toBe('file-image');
          expect(icon.startsWith('file')).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify image files by extension', () => {
      const imageExtArb = fc.constantFrom(...IMAGE_EXTENSIONS);
      const filenameArb = fc.string({ minLength: 1, maxLength: 20 })
        .filter(s => !s.includes('.') && s.length > 0);

      fc.assert(
        fc.property(filenameArb, imageExtArb, (name, ext) => {
          const filename = `${name}.${ext}`;
          expect(isImageByExtension(filename)).toBe(true);
          expect(getFileIconByName(filename)).toBe('file-image');
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify non-image files by extension', () => {
      const nonImageExtArb = fc.constantFrom('pdf', 'doc', 'xls', 'zip', 'txt', 'mp3', 'mp4');
      const filenameArb = fc.string({ minLength: 1, maxLength: 20 })
        .filter(s => !s.includes('.') && s.length > 0);

      fc.assert(
        fc.property(filenameArb, nonImageExtArb, (name, ext) => {
          const filename = `${name}.${ext}`;
          expect(isImageByExtension(filename)).toBe(false);
          expect(getFileIconByName(filename)).not.toBe('file-image');
        }),
        { numRuns: 100 }
      );
    });
  });
});

// ========== Unit Tests ==========

describe('Unit Tests', () => {
  describe('isImageFile', () => {
    it('should return true for valid image MIME types', () => {
      expect(isImageFile('image/jpeg')).toBe(true);
      expect(isImageFile('image/png')).toBe(true);
      expect(isImageFile('image/gif')).toBe(true);
      expect(isImageFile('image/webp')).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(isImageFile('')).toBe(false);
      expect(isImageFile(null as any)).toBe(false);
      expect(isImageFile(undefined as any)).toBe(false);
      expect(isImageFile('text/plain')).toBe(false);
    });
  });

  describe('isImageByExtension', () => {
    it('should return true for valid image extensions', () => {
      expect(isImageByExtension('photo.jpg')).toBe(true);
      expect(isImageByExtension('image.PNG')).toBe(true);
      expect(isImageByExtension('animation.GIF')).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(isImageByExtension('')).toBe(false);
      expect(isImageByExtension('noextension')).toBe(false);
      expect(isImageByExtension('document.pdf')).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid image file', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject file exceeding max size', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      const result = validateImageFile(file, { maxSize: 2 * 1024 * 1024 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2MB');
    });

    it('should reject non-image file', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 });
      
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
    });
  });

  describe('generateThumbnailUrl', () => {
    it('should generate correct thumbnail URL', () => {
      const url = 'https://example.com/image.jpg';
      const result = generateThumbnailUrl(url, 'small');
      
      expect(result).toBe('https://example.com/image.jpg?imageMogr2/thumbnail/64x64');
    });

    it('should handle empty URL', () => {
      expect(generateThumbnailUrl('', 'small')).toBe('');
      expect(generateThumbnailUrl(null as any, 'small')).toBe('');
    });

    it('should handle numeric size', () => {
      const url = 'https://example.com/image.jpg';
      const result = generateThumbnailUrl(url, 200);
      
      expect(result).toContain('thumbnail/200x200');
    });
  });

  describe('getFileIcon', () => {
    it('should return correct icons for known types', () => {
      expect(getFileIcon('application/pdf')).toBe('file-pdf');
      expect(getFileIcon('application/msword')).toBe('file-word');
      expect(getFileIcon('application/zip')).toBe('file-zip');
      expect(getFileIcon('image/jpeg')).toBe('file-image');
    });

    it('should return default icon for unknown types', () => {
      expect(getFileIcon('application/unknown')).toBe('file');
    });
  });
});
