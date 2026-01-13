/**
 * DownloadLink 组件测试
 * Property 16: Download URL Caching
 * Validates: Requirements 8.2, 8.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DownloadLink } from '../DownloadLink';

// Mock uploadApi
vi.mock('@/services/upload/uploadApi', () => ({
  COSUploadApiService: {
    getDownloadToken: vi.fn(),
  },
}));

import { COSUploadApiService } from '@/services/upload/uploadApi';

const mockGetDownloadToken = vi.mocked(COSUploadApiService.getDownloadToken);

describe('DownloadLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Render', () => {
    it('should render default download button', () => {
      render(<DownloadLink fileId="file-123" filename="test.txt" />);
      expect(screen.getByText('下载')).toBeInTheDocument();
    });

    it('should render custom children', () => {
      render(
        <DownloadLink fileId="file-123" filename="test.txt">
          <span>Custom Download</span>
        </DownloadLink>
      );
      expect(screen.getByText('Custom Download')).toBeInTheDocument();
    });
  });

  describe('Download URL Fetching', () => {
    it('should fetch download URL on click', async () => {
      const expireAt = Date.now() + 3600000; // 1 hour from now
      mockGetDownloadToken.mockResolvedValue({
        code: 1,
        message: 'success',
        data: {
          expiredUrl: 'https://example.com/download/file-123',
          expireAt,
        },
      });

      render(<DownloadLink fileId="file-123" filename="test.txt" />);
      
      fireEvent.click(screen.getByText('下载'));

      await waitFor(() => {
        // 组件 prop 名为 fileId，但 API 参数名为 fileUrl
        expect(mockGetDownloadToken).toHaveBeenCalledWith({ fileUrl: 'file-123' });
      });
    });
  });

  // Property 16: Download URL Caching
  describe('URL Caching', () => {
    it('should cache URL and not refetch if not expired', async () => {
      const expireAt = Date.now() + 3600000; // 1 hour from now
      mockGetDownloadToken.mockResolvedValue({
        code: 1,
        message: 'success',
        data: {
          expiredUrl: 'https://example.com/download/file-123',
          expireAt,
        },
      });

      render(<DownloadLink fileId="file-123" filename="test.txt" />);
      
      // First click
      fireEvent.click(screen.getByText('下载'));

      await waitFor(() => {
        expect(mockGetDownloadToken).toHaveBeenCalledTimes(1);
      });

      // Second click - should use cached URL
      fireEvent.click(screen.getByText('下载'));

      // Wait a bit and verify still only 1 call (cached)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockGetDownloadToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      mockGetDownloadToken.mockRejectedValue(new Error('Network error'));

      render(<DownloadLink fileId="file-123" filename="test.txt" />);
      
      fireEvent.click(screen.getByText('下载'));

      // Should not crash, button should still be clickable
      await waitFor(() => {
        expect(screen.getByText('下载')).toBeInTheDocument();
      });
    });
  });
});
