/**
 * FileDisplay 组件单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FileDisplay } from '../index';

// Mock DownloadLink 组件
vi.mock('@/components/upload/DownloadLink', () => ({
  DownloadLink: ({ children, fileId, filename }: any) => (
    <span data-testid="download-link" data-file-id={fileId}>
      {children}
    </span>
  ),
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

describe('FileDisplay', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('File Type Detection', () => {
    it('should display image thumbnail for image files', async () => {
      render(
        <FileDisplay
          fileId="123"
          filename="photo.jpg"
          url="https://example.com/photo.jpg"
          mimeType="image/jpeg"
        />
      );

      await waitFor(() => {
        const img = document.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });

    it('should display file icon for non-image files', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          mimeType="application/pdf"
        />
      );

      // 应该显示 PDF 图标
      expect(document.querySelector('.anticon-file-pdf')).toBeInTheDocument();
    });

    it('should display word icon for Word documents', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.docx"
          mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
      );

      expect(document.querySelector('.anticon-file-word')).toBeInTheDocument();
    });

    it('should display excel icon for Excel files by extension', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="spreadsheet.xlsx"
        />
      );

      expect(document.querySelector('.anticon-file-excel')).toBeInTheDocument();
    });

    it('should display zip icon for archive files', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="archive.zip"
          mimeType="application/zip"
        />
      );

      expect(document.querySelector('.anticon-file-zip')).toBeInTheDocument();
    });

    it('should fallback to extension-based detection', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
        />
      );

      expect(document.querySelector('.anticon-file-pdf')).toBeInTheDocument();
    });
  });

  describe('Display Modes', () => {
    it('should render in thumbnail mode by default', () => {
      const { container } = render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          width={120}
          height={120}
        />
      );

      // 检查容器尺寸
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('should render in list mode with file info', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          size={1024}
          mode="list"
        />
      );

      // 列表模式应显示文件名
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      // 检查大小显示（formatBytes 返回 "1.00 KB"）
      expect(screen.getByText('1.00 KB')).toBeInTheDocument();
    });

    it('should render in card mode', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          size={2048}
          mimeType="application/pdf"
          mode="card"
        />
      );

      // 卡片模式应显示文件名
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should show download link in list mode when downloadable', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          downloadable={true}
          mode="list"
        />
      );

      expect(screen.getByTestId('download-link')).toBeInTheDocument();
    });

    it('should hide download link when not downloadable', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="document.pdf"
          downloadable={false}
          mode="list"
        />
      );

      expect(screen.queryByTestId('download-link')).not.toBeInTheDocument();
    });

    it('should show preview button for images when previewable', async () => {
      render(
        <FileDisplay
          fileId="123"
          filename="photo.jpg"
          url="https://example.com/photo.jpg"
          mimeType="image/jpeg"
          previewable={true}
        />
      );

      await waitFor(() => {
        expect(document.querySelector('.anticon-eye')).toBeInTheDocument();
      });
    });
  });

  describe('File Size Display', () => {
    it('should display formatted file size in list mode', () => {
      render(
        <FileDisplay
          fileId="123"
          filename="large-file.zip"
          size={1024 * 1024 * 5} // 5MB
          mode="list"
        />
      );

      expect(screen.getByText('5.00 MB')).toBeInTheDocument();
    });
  });
});
