/**
 * ImageUploader 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ImageUploader } from '../index';

// Mock useCOSUpload hook
vi.mock('@/hooks/useCOSUpload', () => ({
  useCOSUpload: vi.fn(() => ({
    tasks: [],
    addFiles: vi.fn(),
    retry: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    pauseAll: vi.fn(),
    resumeAll: vi.fn(),
    cancelAll: vi.fn(),
    isUploading: false,
    isOnline: true,
  })),
}));

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
      if (value.includes('error')) {
        this.onerror?.();
      } else if (value) {
        this.onload?.();
      }
    }, 10);
  }
}

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload placeholder when no value', () => {
      render(<ImageUploader />);

      expect(screen.getByText('上传图片')).toBeInTheDocument();
    });

    it('should render custom placeholder', () => {
      render(<ImageUploader placeholder="选择图片" />);

      expect(screen.getByText('选择图片')).toBeInTheDocument();
    });

    it('should render with custom dimensions', () => {
      const { container } = render(
        <ImageUploader width={200} height={150} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '200px', height: '150px' });
    });

    it('should render circle style', () => {
      const { container } = render(
        <ImageUploader circle width={100} height={100} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ borderRadius: '50%' });
    });

    it('should render image preview when value is provided', async () => {
      render(
        <ImageUploader value="https://example.com/image.jpg" />
      );

      await waitFor(() => {
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('File Validation', () => {
    it('should accept valid image files', () => {
      const { container } = render(<ImageUploader />);

      // 验证 accept 属性
      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'image/*');
    });

    it('should use custom accept prop', () => {
      const { container } = render(
        <ImageUploader accept=".jpg,.png" />
      );

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', '.jpg,.png');
    });
  });

  describe('Disabled State', () => {
    it('should disable upload when disabled prop is true', () => {
      const { container } = render(<ImageUploader disabled />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('Upload States', () => {
    it('should show placeholder icon', () => {
      render(<ImageUploader />);

      expect(document.querySelector('.anticon-picture')).toBeInTheDocument();
    });
  });
});
