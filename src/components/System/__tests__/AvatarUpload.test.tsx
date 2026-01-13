/**
 * AvatarUpload 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AvatarUpload from '../AvatarUpload';

// Mock ThemeContext
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

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

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload placeholder when no value', () => {
      render(<AvatarUpload />);

      expect(screen.getByText('上传头像')).toBeInTheDocument();
    });

    it('should render with custom size', () => {
      const { container } = render(<AvatarUpload size={120} />);

      const wrapper = container.querySelector('.avatar-uploader .ant-upload');
      expect(wrapper).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('should render help text with max size', () => {
      render(<AvatarUpload maxSize={5 * 1024 * 1024} />);

      expect(screen.getByText(/不超过 5MB/)).toBeInTheDocument();
    });

    it('should render avatar preview when value is provided', async () => {
      render(<AvatarUpload value="https://example.com/avatar.jpg" />);

      await waitFor(() => {
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('Circular Style', () => {
    it('should have circular border radius', () => {
      const { container } = render(<AvatarUpload />);

      const uploadArea = container.querySelector('.avatar-uploader .ant-upload');
      expect(uploadArea).toHaveStyle({ borderRadius: '50%' });
    });
  });

  describe('Disabled State', () => {
    it('should disable upload when disabled prop is true', () => {
      const { container } = render(<AvatarUpload disabled />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });
  });

  describe('File Acceptance', () => {
    it('should accept image files', () => {
      const { container } = render(<AvatarUpload />);

      const input = container.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('Hover Overlay', () => {
    it('should show camera icon overlay when hovering over existing avatar', async () => {
      render(<AvatarUpload value="https://example.com/avatar.jpg" />);

      await waitFor(() => {
        const overlay = document.querySelector('.avatar-overlay');
        expect(overlay).toBeInTheDocument();
      });
    });
  });
});
