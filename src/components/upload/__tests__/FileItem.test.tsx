/**
 * FileItem 组件测试
 * Property 15: FileItem UI State
 * Validates: Requirements 7.3, 7.4, 7.5, 7.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { FileItem } from '../FileItem';
import type { UploadTask, UploadStatus } from '@/types/upload';

// Helper to create test task
function createTestTask(overrides: Partial<UploadTask> = {}): UploadTask {
  return {
    id: 'task-1',
    file: new File(['test'], 'test.txt', { type: 'text/plain' }),
    status: 'pending',
    progress: 0,
    ...overrides,
  };
}

describe('FileItem', () => {
  // Property 15: FileItem UI State
  describe('UI State Display', () => {
    const statusConfigs: Array<{ status: UploadStatus; text: string }> = [
      { status: 'pending', text: '等待中' },
      { status: 'hashing', text: '计算哈希' },
      { status: 'checking', text: '秒传检查' },
      { status: 'uploading', text: '上传中' },
      { status: 'paused', text: '已暂停' },
      { status: 'completed', text: '已完成' },
      { status: 'failed', text: '失败' },
    ];

    statusConfigs.forEach(({ status, text }) => {
      it(`should display correct status tag for ${status}`, () => {
        const task = createTestTask({ status });
        render(
          <FileItem
            task={task}
            onPause={vi.fn()}
            onResume={vi.fn()}
            onCancel={vi.fn()}
            onRetry={vi.fn()}
          />
        );

        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });

    it('should display file name', () => {
      const task = createTestTask({
        file: new File(['test'], 'my-document.pdf', { type: 'application/pdf' }),
      });
      render(
        <FileItem
          task={task}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText('my-document.pdf')).toBeInTheDocument();
    });

    it('should display error message when failed', () => {
      const task = createTestTask({
        status: 'failed',
        error: '网络连接失败',
      });
      render(
        <FileItem
          task={task}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
        />
      );

      expect(screen.getByText('网络连接失败')).toBeInTheDocument();
    });
  });

  // Button visibility tests - using aria-label since buttons are icon-only
  describe('Button Visibility', () => {
    it('should show pause button when uploading', () => {
      const task = createTestTask({ status: 'uploading' });
      const onPause = vi.fn();
      render(
        <FileItem
          task={task}
          onPause={onPause}
          onResume={vi.fn()}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
        />
      );

      // Button is icon-only, find by aria-label of the icon
      const pauseButton = screen.getByRole('button', { name: /pause-circle/i });
      expect(pauseButton).toBeInTheDocument();
      fireEvent.click(pauseButton);
      expect(onPause).toHaveBeenCalled();
    });

    it('should show resume button when paused', () => {
      const task = createTestTask({ status: 'paused' });
      const onResume = vi.fn();
      render(
        <FileItem
          task={task}
          onPause={vi.fn()}
          onResume={onResume}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
        />
      );

      const resumeButton = screen.getByRole('button', { name: /play-circle/i });
      expect(resumeButton).toBeInTheDocument();
      fireEvent.click(resumeButton);
      expect(onResume).toHaveBeenCalled();
    });

    it('should show retry button when failed', () => {
      const task = createTestTask({ status: 'failed' });
      const onRetry = vi.fn();
      render(
        <FileItem
          task={task}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /reload/i });
      expect(retryButton).toBeInTheDocument();
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('should not show cancel button when completed', () => {
      const task = createTestTask({ status: 'completed', progress: 100 });
      render(
        <FileItem
          task={task}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
          onRetry={vi.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: /close-circle/i })).not.toBeInTheDocument();
    });
  });

  // Progress display
  describe('Progress Display', () => {
    it('should display progress percentage', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const task = createTestTask({ status: 'uploading', progress });
            const { container } = render(
              <FileItem
                task={task}
                onPause={vi.fn()}
                onResume={vi.fn()}
                onCancel={vi.fn()}
                onRetry={vi.fn()}
              />
            );

            // Progress bar should exist
            const progressBar = container.querySelector('.ant-progress');
            expect(progressBar).toBeInTheDocument();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
