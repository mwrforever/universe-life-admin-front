/**
 * ThumbnailImage 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThumbnailImage } from '../index';

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
    setTimeout(() => {
      if (value.includes('error') || value.includes('fail')) {
        this.onerror?.();
      } else if (value) {
        this.onload?.();
      }
    }, 10);
  }
}

describe('ThumbnailImage', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Rendering', () => {
    it('should render with src', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={100}
          height={100}
        />
      );

      // 等待图片加载
      await waitFor(() => {
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('alt', 'Test image');
      });
    });

    it('should show placeholder when src is empty', () => {
      render(<ThumbnailImage src="" width={100} height={100} />);

      // 应该显示占位图标
      expect(document.querySelector('.anticon-picture')).toBeInTheDocument();
    });

    it('should apply width and height', () => {
      const { container } = render(
        <ThumbnailImage src="" width={200} height={150} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '200px', height: '150px' });
    });

    it('should apply string dimensions', () => {
      const { container } = render(
        <ThumbnailImage src="" width="100%" height="auto" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '100%', height: 'auto' });
    });

    it('should apply circle style', () => {
      const { container } = render(
        <ThumbnailImage src="" width={100} height={100} circle />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ borderRadius: '50%' });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while loading', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          width={100}
          height={100}
        />
      );

      // 初始应该显示加载状态
      expect(document.querySelector('.anticon-loading')).toBeInTheDocument();

      // 等待加载完成
      await waitFor(() => {
        expect(document.querySelector('.anticon-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error placeholder when both thumbnail and original fail', async () => {
      // 使用 error 关键字使两者都失败
      render(
        <ThumbnailImage
          src="https://example.com/error.jpg"
          width={100}
          height={100}
          progressive={true}
        />
      );

      // 等待错误状态
      await waitFor(
        () => {
          expect(screen.getByText('加载失败')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should show custom fallback on error', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/error.jpg"
          width={100}
          height={100}
          progressive={true}
          fallback={<div data-testid="custom-fallback">Custom Error</div>}
        />
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          width={100}
          height={100}
          onClick={handleClick}
        />
      );

      // 等待图片加载
      await waitFor(() => {
        expect(document.querySelector('img')).toBeInTheDocument();
      });

      // 点击容器
      const wrapper = container.firstChild as HTMLElement;
      await user.click(wrapper);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Sizes', () => {
    it('should work with small thumbnail size', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          thumbnailSize="small"
          width={64}
          height={64}
        />
      );

      await waitFor(() => {
        expect(document.querySelector('img')).toBeInTheDocument();
      });
    });

    it('should work with large thumbnail size', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          thumbnailSize="large"
          width={256}
          height={256}
        />
      );

      await waitFor(() => {
        expect(document.querySelector('img')).toBeInTheDocument();
      });
    });
  });

  describe('Object Fit', () => {
    it('should render image with objectFit prop', async () => {
      render(
        <ThumbnailImage
          src="https://example.com/image.jpg"
          width={100}
          height={100}
          objectFit="contain"
        />
      );

      await waitFor(() => {
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
      });

      // 验证图片已渲染
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });
});
