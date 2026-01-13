/**
 * useThumbnail Hook 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useThumbnail } from '../useThumbnail';
import { THUMBNAIL_SIZES } from '@/utils/thumbnail';

// Mock Image 对象
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // 模拟异步加载
    setTimeout(() => {
      if (value.includes('error') || value.includes('fail')) {
        this.onerror?.();
      } else if (value) {
        this.onload?.();
      }
    }, 10);
  }
}

describe('useThumbnail', () => {
  beforeEach(() => {
    // Mock Image 构造函数
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('URL Generation', () => {
    it('should generate correct thumbnail URL', () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
          size: 'small',
          progressive: false,
          preloadOriginal: false,
        })
      );

      expect(result.current.thumbnailSrc).toContain('imageMogr2');
      expect(result.current.thumbnailSrc).toContain(`${THUMBNAIL_SIZES.small}x${THUMBNAIL_SIZES.small}`);
      expect(result.current.originalSrc).toBe('https://example.com/image.jpg');
    });

    it('should handle empty src', () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: '',
          size: 'medium',
        })
      );

      expect(result.current.thumbnailSrc).toBe('');
      expect(result.current.originalSrc).toBe('');
      expect(result.current.currentSrc).toBe('');
    });

    it('should use medium size by default', () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
        })
      );

      expect(result.current.thumbnailSrc).toContain(`${THUMBNAIL_SIZES.medium}x${THUMBNAIL_SIZES.medium}`);
    });
  });

  describe('Loading States', () => {
    it('should start with loading state when src is provided', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
          progressive: true,
        })
      );

      // 初始状态应该是加载中
      expect(result.current.loading).toBe(true);

      // 等待加载完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not be loading when src is empty', () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: '',
        })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.loadingThumbnail).toBe(false);
      expect(result.current.loadingOriginal).toBe(false);
    });
  });

  describe('Progressive Loading', () => {
    it('should load thumbnail first then original in progressive mode', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
          progressive: true,
          preloadOriginal: true,
        })
      );

      // 等待缩略图加载
      await waitFor(() => {
        expect(result.current.isThumbnailLoaded).toBe(true);
      });

      // 等待原图加载
      await waitFor(() => {
        expect(result.current.isOriginalLoaded).toBe(true);
      });

      // 最终应该显示原图
      expect(result.current.currentSrc).toBe('https://example.com/image.jpg');
      // 缩略图应该已加载
      expect(result.current.isThumbnailLoaded).toBe(true);
    });

    it('should load original directly when progressive is false', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
          progressive: false,
        })
      );

      await waitFor(() => {
        expect(result.current.isOriginalLoaded).toBe(true);
      });

      // 应该直接显示原图
      expect(result.current.currentSrc).toBe('https://example.com/image.jpg');
      // 缩略图不应该被加载
      expect(result.current.isThumbnailLoaded).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle thumbnail load error', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/error-image.jpg',
          progressive: true,
          preloadOriginal: false,
        })
      );

      await waitFor(() => {
        expect(result.current.loadingThumbnail).toBe(false);
      });

      expect(result.current.thumbnailError).toBe(true);
    });

    it('should handle original load error', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/fail.jpg',
          progressive: false,
        })
      );

      await waitFor(() => {
        expect(result.current.loadingOriginal).toBe(false);
      });

      expect(result.current.originalError).toBe(true);
    });
  });

  describe('Reload', () => {
    it('should reload images when reload is called', async () => {
      const { result } = renderHook(() =>
        useThumbnail({
          src: 'https://example.com/image.jpg',
          progressive: false,
        })
      );

      await waitFor(() => {
        expect(result.current.isOriginalLoaded).toBe(true);
      });

      // 调用 reload
      act(() => {
        result.current.reload();
      });

      // 应该重新开始加载
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.isOriginalLoaded).toBe(true);
      });
    });
  });

  describe('Src Change', () => {
    it('should reload when src changes', async () => {
      const { result, rerender } = renderHook(
        ({ src }) => useThumbnail({ src, progressive: false }),
        { initialProps: { src: 'https://example.com/image1.jpg' } }
      );

      await waitFor(() => {
        expect(result.current.isOriginalLoaded).toBe(true);
      });

      expect(result.current.currentSrc).toBe('https://example.com/image1.jpg');

      // 更改 src
      rerender({ src: 'https://example.com/image2.jpg' });

      await waitFor(() => {
        expect(result.current.currentSrc).toBe('https://example.com/image2.jpg');
      });
    });
  });
});
