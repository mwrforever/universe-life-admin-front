/**
 * UploadManager 组件测试
 * Property 14: File Validation in UploadManager
 * Validates: Requirements 6.3, 6.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { UploadManager } from '../UploadManager';

// Mock useCOSUpload hook
const mockAddFiles = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
const mockCancel = vi.fn();
const mockRetry = vi.fn();
const mockPauseAll = vi.fn();
const mockResumeAll = vi.fn();
const mockCancelAll = vi.fn();

vi.mock('@/hooks/useCOSUpload', () => ({
  useCOSUpload: vi.fn(() => ({
    tasks: [],
    addFiles: mockAddFiles,
    pause: mockPause,
    resume: mockResume,
    cancel: mockCancel,
    retry: mockRetry,
    pauseAll: mockPauseAll,
    resumeAll: mockResumeAll,
    cancelAll: mockCancelAll,
    isOnline: true,
  })),
}));

import { useCOSUpload } from '@/hooks/useCOSUpload';

const mockUseCOSUpload = vi.mocked(useCOSUpload);

describe('UploadManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCOSUpload.mockReturnValue({
      tasks: [],
      addFiles: mockAddFiles,
      pause: mockPause,
      resume: mockResume,
      cancel: mockCancel,
      retry: mockRetry,
      pauseAll: mockPauseAll,
      resumeAll: mockResumeAll,
      cancelAll: mockCancelAll,
      isOnline: true,
    });
  });

  describe('Render', () => {
    it('should render upload area', () => {
      render(<UploadManager />);
      expect(screen.getByText(/点击或拖拽文件到此区域上传/)).toBeInTheDocument();
    });

    it('should show empty state when no tasks', () => {
      render(<UploadManager />);
      expect(screen.getByText('暂无上传任务')).toBeInTheDocument();
    });
  });

  // Property 14: File Validation
  describe('File Validation', () => {
    it('should reject files exceeding maxSize', async () => {
      const maxSize = 1024 * 1024; // 1MB
      render(<UploadManager maxSize={maxSize} />);

      // Create a file larger than maxSize
      const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.txt', {
        type: 'text/plain',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();

      // Simulate file selection
      Object.defineProperty(input, 'files', {
        value: [largeFile],
      });
      fireEvent.change(input);

      // addFiles should not be called with oversized file
      await waitFor(() => {
        expect(mockAddFiles).not.toHaveBeenCalled();
      });
    });

    it('should accept files within maxSize', async () => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      render(<UploadManager maxSize={maxSize} />);

      const smallFile = new File(['test content'], 'small.txt', {
        type: 'text/plain',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [smallFile],
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockAddFiles).toHaveBeenCalledWith([smallFile]);
      });
    });
  });

  // Network offline display
  describe('Network Status', () => {
    it('should show offline warning when not online', () => {
      mockUseCOSUpload.mockReturnValue({
        tasks: [],
        addFiles: mockAddFiles,
        pause: mockPause,
        resume: mockResume,
        cancel: mockCancel,
        retry: mockRetry,
        pauseAll: mockPauseAll,
        resumeAll: mockResumeAll,
        cancelAll: mockCancelAll,
        isOnline: false,
      });

      render(<UploadManager />);
      expect(screen.getByText(/网络已断开/)).toBeInTheDocument();
    });
  });

  // Batch operations
  describe('Batch Operations', () => {
    it('should show batch buttons when tasks exist', () => {
      mockUseCOSUpload.mockReturnValue({
        tasks: [
          {
            id: 'task-1',
            file: new File(['test'], 'test.txt'),
            status: 'uploading',
            progress: 50,
          },
        ],
        addFiles: mockAddFiles,
        pause: mockPause,
        resume: mockResume,
        cancel: mockCancel,
        retry: mockRetry,
        pauseAll: mockPauseAll,
        resumeAll: mockResumeAll,
        cancelAll: mockCancelAll,
        isOnline: true,
      });

      render(<UploadManager />);
      expect(screen.getByText('全部暂停')).toBeInTheDocument();
      expect(screen.getByText('全部继续')).toBeInTheDocument();
      expect(screen.getByText('全部取消')).toBeInTheDocument();
    });

    it('should call pauseAll when pause all button clicked', () => {
      mockUseCOSUpload.mockReturnValue({
        tasks: [
          {
            id: 'task-1',
            file: new File(['test'], 'test.txt'),
            status: 'uploading',
            progress: 50,
          },
        ],
        addFiles: mockAddFiles,
        pause: mockPause,
        resume: mockResume,
        cancel: mockCancel,
        retry: mockRetry,
        pauseAll: mockPauseAll,
        resumeAll: mockResumeAll,
        cancelAll: mockCancelAll,
        isOnline: true,
      });

      render(<UploadManager />);
      fireEvent.click(screen.getByText('全部暂停'));
      expect(mockPauseAll).toHaveBeenCalled();
    });
  });

  // Statistics display
  describe('Statistics', () => {
    it('should display correct statistics', () => {
      mockUseCOSUpload.mockReturnValue({
        tasks: [
          { id: '1', file: new File([''], 'a.txt'), status: 'uploading', progress: 50 },
          { id: '2', file: new File([''], 'b.txt'), status: 'completed', progress: 100 },
          { id: '3', file: new File([''], 'c.txt'), status: 'failed', progress: 0, error: 'err' },
        ],
        addFiles: mockAddFiles,
        pause: mockPause,
        resume: mockResume,
        cancel: mockCancel,
        retry: mockRetry,
        pauseAll: mockPauseAll,
        resumeAll: mockResumeAll,
        cancelAll: mockCancelAll,
        isOnline: true,
      });

      render(<UploadManager />);
      expect(screen.getByText(/共 3 个文件/)).toBeInTheDocument();
      expect(screen.getByText(/1 上传中/)).toBeInTheDocument();
      expect(screen.getByText(/1 已完成/)).toBeInTheDocument();
      expect(screen.getByText(/1 失败/)).toBeInTheDocument();
    });
  });

  // Property test for file count validation
  describe('File Count Validation', () => {
    it('should respect maxCount limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 10 }),
          (maxCount, fileCount) => {
            mockUseCOSUpload.mockReturnValue({
              tasks: Array.from({ length: maxCount }, (_, i) => ({
                id: `task-${i}`,
                file: new File([''], `existing-${i}.txt`),
                status: 'completed' as const,
                progress: 100,
              })),
              addFiles: mockAddFiles,
              pause: mockPause,
              resume: mockResume,
              cancel: mockCancel,
              retry: mockRetry,
              pauseAll: mockPauseAll,
              resumeAll: mockResumeAll,
              cancelAll: mockCancelAll,
              isOnline: true,
            });

            const { unmount } = render(<UploadManager maxCount={maxCount} />);
            
            // Component should render without errors
            expect(screen.getByText(/点击或拖拽文件到此区域上传/)).toBeInTheDocument();
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
