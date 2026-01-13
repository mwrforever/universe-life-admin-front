/**
 * 图片上传组件
 * 集成 COS 直传功能，支持进度显示和预览
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Progress, message, Spin } from 'antd';
import {
  PlusOutlined,
  LoadingOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useCOSUpload } from '@/hooks/useCOSUpload';
import { validateImageFile, DEFAULT_MAX_IMAGE_SIZE } from '@/utils/thumbnail';
import { ThumbnailImage } from '../ThumbnailImage';
import type { RcFile } from 'antd/es/upload/interface';

export interface ImageUploaderProps {
  /** 当前图片 URL */
  value?: string;
  /** 图片变更回调，返回文件 ID 和 URL */
  onChange?: (fileId: string, url: string) => void;
  /** 接受的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传区域宽度 */
  width?: number;
  /** 上传区域高度 */
  height?: number;
  /** 占位文本 */
  placeholder?: string;
  /** 上传完成回调 */
  onComplete?: (fileId: string, downloadPath: string) => void;
  /** 上传错误回调 */
  onError?: (error: Error) => void;
  /** 是否为圆形 */
  circle?: boolean;
}

interface UploaderContainerProps {
  $width: number;
  $height: number;
  $circle: boolean;
  $disabled: boolean;
  $hasImage: boolean;
}

const UploaderContainer = styled.div<UploaderContainerProps>`
  position: relative;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border-radius: ${props => (props.$circle ? '50%' : '8px')};
  overflow: hidden;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => (props.$disabled ? '#d9d9d9' : '#1677ff')};
  }

  .ant-upload {
    width: 100%;
    height: 100%;
  }

  .ant-upload-select {
    width: 100%;
    height: 100%;
  }
`;

const UploadPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  gap: 8px;

  .anticon {
    font-size: 24px;
    color: #d9d9d9;
  }

  .text {
    font-size: 12px;
  }
`;

const ImagePreview = styled.div<{ $circle: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: ${props => (props.$circle ? '50%' : '0')};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  .action-btn {
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ProgressOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ff4d4f;

  .error-text {
    font-size: 12px;
    max-width: 80%;
    text-align: center;
    word-break: break-word;
  }

  .retry-btn {
    cursor: pointer;
    padding: 4px 12px;
    border: 1px solid #ff4d4f;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: #ff4d4f;
      color: #fff;
    }
  }
`;

/**
 * 图片上传组件
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  accept = 'image/*',
  maxSize = DEFAULT_MAX_IMAGE_SIZE,
  disabled = false,
  width = 120,
  height = 120,
  placeholder = '上传图片',
  onComplete,
  onError,
  circle = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 同步外部 value
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const { tasks, addFiles, retry, cancel } = useCOSUpload({
    onComplete: (task) => {
      if (task.fileId && task.downloadPath) {
        setImageUrl(task.downloadPath);
        setUploading(false);
        setProgress(0);
        setError(null);
        onChange?.(task.fileId, task.downloadPath);
        onComplete?.(task.fileId, task.downloadPath);
      }
    },
    onError: (task, err) => {
      setUploading(false);
      setError(err.message || '上传失败');
      onError?.(err);
    },
  });

  // 监听上传进度
  useEffect(() => {
    const currentTask = tasks[tasks.length - 1];
    if (currentTask) {
      setProgress(currentTask.progress);
      if (currentTask.status === 'failed' && currentTask.error) {
        setError(currentTask.error);
        setUploading(false);
      }
    }
  }, [tasks]);

  /**
   * 处理文件选择
   */
  const handleBeforeUpload = useCallback(
    (file: RcFile): boolean => {
      // 验证文件
      const validation = validateImageFile(file, { maxSize });
      if (!validation.valid) {
        message.error(validation.error);
        return false;
      }

      // 开始上传
      setUploading(true);
      setProgress(0);
      setError(null);
      addFiles([file]);

      return false; // 阻止默认上传
    },
    [addFiles, maxSize]
  );

  /**
   * 处理删除
   */
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setImageUrl(undefined);
      setError(null);
      onChange?.('', '');
    },
    [onChange]
  );

  /**
   * 处理重试
   */
  const handleRetry = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentTask = tasks[tasks.length - 1];
      if (currentTask) {
        setUploading(true);
        setError(null);
        retry(currentTask.id);
      }
    },
    [tasks, retry]
  );

  const hasImage = !!imageUrl;
  const showProgress = uploading && !error;
  const showError = !!error && !uploading;

  return (
    <UploaderContainer
      $width={width}
      $height={height}
      $circle={circle}
      $disabled={disabled}
      $hasImage={hasImage}
    >
      <Upload
        accept={accept}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        disabled={disabled || uploading}
      >
        {hasImage ? (
          <ImagePreview $circle={circle}>
            <ThumbnailImage
              src={imageUrl}
              width={width}
              height={height}
              thumbnailSize="medium"
            />
            {!disabled && !uploading && !error && (
              <Overlay>
                <DeleteOutlined className="action-btn" onClick={handleDelete} />
              </Overlay>
            )}
          </ImagePreview>
        ) : (
          <UploadPlaceholder>
            {uploading ? (
              <LoadingOutlined />
            ) : (
              <>
                <PictureOutlined />
                <span className="text">{placeholder}</span>
              </>
            )}
          </UploadPlaceholder>
        )}
      </Upload>

      {/* 上传进度 */}
      {showProgress && (
        <ProgressOverlay>
          <Spin indicator={<LoadingOutlined spin />} />
          <Progress
            type="circle"
            percent={progress}
            size={Math.min(width, height) * 0.5}
            strokeWidth={8}
          />
        </ProgressOverlay>
      )}

      {/* 错误状态 */}
      {showError && (
        <ErrorOverlay>
          <span className="error-text">{error}</span>
          <span className="retry-btn" onClick={handleRetry}>
            <ReloadOutlined /> 重试
          </span>
        </ErrorOverlay>
      )}
    </UploaderContainer>
  );
};

export default ImageUploader;
