/**
 * 头像上传组件
 * 集成 COS 直传功能，支持圆形头像上传和预览
 * 
 * 功能特点：
 * 1. 上传时先显示本地缩略图预览（即时反馈）
 * 2. 上传成功后使用签名 URL 显示图片
 * 3. onChange 回调返回文件 key（用于数据保存）
 * 4. 从数据库读取 key 时，调用 API 获取签名 URL 显示
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Avatar, Spin, Progress } from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';
import { useCOSUpload } from '@/hooks/useCOSUpload';
import { validateImageFile, DEFAULT_MAX_IMAGE_SIZE } from '@/utils/thumbnail';
import { ThumbnailImage } from '@/components/common/ThumbnailImage';
import { showSuccessMessage, showErrorMessage } from '@/utils/antdStatic';
import { COSUploadApiService } from '@/services/upload/uploadApi';
import { updateSignedUrlCache } from '@/utils/signedUrl';
import type { RcFile } from 'antd/es/upload/interface';

interface AvatarUploadProps {
  /** 当前头像 key（COS 文件路径）或完整 URL */
  value?: string;
  /** 头像变更回调，返回文件 key（用于数据保存） */
  onChange?: (key: string) => void;
  /** 头像尺寸 */
  size?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大文件大小（字节），默认 5MB */
  maxSize?: number;
}

/**
 * 判断是否为完整 URL
 */
function isFullUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('blob:');
}

const UploadWrapper = styled.div<{ $size: number; $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .avatar-uploader {
    .ant-upload {
      width: ${props => props.$size}px;
      height: ${props => props.$size}px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      border: 2px dashed ${props => props.$isDark
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.15)'};
      background: ${props => props.$isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.02)'};
      transition: all 0.3s ease;

      &:hover {
        border-color: #1677ff;
      }
    }
  }
`;

const UploadArea = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProgressArea = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;

  .progress-text {
    font-size: 12px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'};
  }

  .status-text {
    font-size: 11px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const AvatarContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  overflow: hidden;

  .avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;

    .anticon {
      font-size: 24px;
      color: #fff;
    }
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

const UploadPlaceholder = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .anticon {
    font-size: 20px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }

  .text {
    font-size: 11px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const HelpText = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'};
  text-align: center;
  line-height: 1.4;
`;

const ErrorText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff4d4f;

  .retry-btn {
    cursor: pointer;
    color: #1677ff;
    display: flex;
    align-items: center;
    gap: 2px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  size = 100,
  disabled = false,
  maxSize = DEFAULT_MAX_IMAGE_SIZE,
}) => {
  const { isDarkMode } = useTheme();
  // 签名后的 URL（用于显示图片）
  const [signedUrl, setSignedUrl] = useState<string | undefined>(undefined);
  // 本地预览 URL（上传过程中显示）
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  
  // 用于清理 blob URL
  const blobUrlRef = useRef<string | null>(null);
  // 记录上一次的 value，避免重复请求
  const prevValueRef = useRef<string | undefined>(undefined);

  // 当外部 value 变化时，获取签名 URL
  useEffect(() => {
    // 如果 value 没有变化，不重复请求
    if (value === prevValueRef.current) {
      return;
    }
    prevValueRef.current = value;

    if (!value) {
      setSignedUrl(undefined);
      return;
    }

    // 如果已经是完整 URL（签名 URL 或 blob URL），直接使用
    if (isFullUrl(value)) {
      setSignedUrl(value);
      return;
    }

    // 否则是 key，需要调用 API 获取签名 URL
    const fetchSignedUrl = async () => {
      setLoadingSignedUrl(true);
      try {
        const response = await COSUploadApiService.getDownloadToken({ fileUrl: value });
        if (response.data?.expiredUrl) {
          setSignedUrl(response.data.expiredUrl);
        }
      } catch (err) {
        console.error('获取签名 URL 失败:', err);
        // 失败时不显示图片
        setSignedUrl(undefined);
      } finally {
        setLoadingSignedUrl(false);
      }
    };

    fetchSignedUrl();
  }, [value]);
  
  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // 稳定的回调函数，避免 useCOSUpload 内部依赖链不稳定
  const handleUploadComplete = useCallback((task: { key?: string; downloadPath?: string; signedUrl?: string; expireAt?: number }) => {
    // signedUrl 是签名后的 URL，用于显示图片
    // downloadPath 是正式桶中的文件路径，用于数据保存
    const taskSignedUrl = task.signedUrl;
    const fileKey = task.downloadPath;  // 正式桶的 key，用于保存到数据库
    const expireAt = task.expireAt;  // 签名过期时间
    
    console.log('✅ AvatarUpload 上传完成:', { signedUrl: taskSignedUrl, fileKey, expireAt });
    
    if (taskSignedUrl && fileKey) {
      // 使用签名 URL 显示图片
      setSignedUrl(taskSignedUrl);
      // 更新 prevValueRef，避免触发重复请求
      prevValueRef.current = fileKey;
      
      // 将签名 URL 缓存起来，供后续使用（避免重复签名）
      // 如果没有 expireAt，使用默认的 30 分钟过期时间
      const cacheExpireAt = expireAt || Math.floor(Date.now() / 1000) + 30 * 60;
      console.log('📦 AvatarUpload 缓存签名 URL:', { fileKey, taskSignedUrl, cacheExpireAt });
      updateSignedUrlCache(fileKey, taskSignedUrl, cacheExpireAt);
      
      setUploading(false);
      setProgress(0);
      setError(null);
      // 清理本地预览 URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setLocalPreviewUrl(null);
      // 返回正式桶的 key 给父组件（用于数据保存）
      console.log('📤 AvatarUpload 调用 onChange:', fileKey);
      onChange?.(fileKey);
      showSuccessMessage('头像上传成功！');
    }
  }, [onChange]);

  const handleUploadError = useCallback((_task: unknown, err: Error) => {
    setUploading(false);
    setError(err.message || '上传失败');
    showErrorMessage('头像上传失败，请重试');
  }, []);

  const { tasks, addFiles, retry } = useCOSUpload({
    onComplete: handleUploadComplete,
    onError: handleUploadError,
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
      console.log('📁 handleBeforeUpload called with file:', file.name, file.type, file.size);
      
      // 验证文件
      const validation = validateImageFile(file, { maxSize });
      console.log('✅ Validation result:', validation);
      
      if (!validation.valid) {
        console.log('❌ Validation failed:', validation.error);
        showErrorMessage(validation.error || '文件验证失败');
        return false;
      }

      // 创建本地预览 URL（即时反馈）
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const previewUrl = URL.createObjectURL(file);
      blobUrlRef.current = previewUrl;
      setLocalPreviewUrl(previewUrl);

      // 开始上传
      console.log('🚀 Starting upload, calling addFiles...');
      setUploading(true);
      setProgress(0);
      setError(null);
      
      // 使用 setTimeout 确保状态更新后再调用 addFiles
      setTimeout(() => {
        console.log('📤 Calling addFiles with file:', file.name);
        addFiles([file]);
      }, 0);

      return false; // 阻止默认上传
    },
    [addFiles, maxSize]
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

  const showProgress = uploading && !error;
  const showError = !!error && !uploading;
  
  // 计算显示的图片 URL：优先本地预览，其次签名 URL
  const displayImageUrl = localPreviewUrl || signedUrl;

  // 获取上传状态文本
  const getStatusText = () => {
    const currentTask = tasks[tasks.length - 1];
    if (!currentTask) return '上传中...';
    switch (currentTask.status) {
      case 'hashing': return '计算中...';
      case 'checking': return '检查中...';
      case 'uploading': return '上传中...';
      default: return '处理中...';
    }
  };

  const uploadContent = displayImageUrl ? (
    <AvatarContainer $size={size}>
      <ThumbnailImage
        src={displayImageUrl}
        width={size}
        height={size}
        circle
        thumbnailSize="medium"
        fallback={<Avatar size={size} icon={<UserOutlined />} />}
      />
      {!disabled && !uploading && !error && (
        <div className="avatar-overlay">
          <CameraOutlined />
        </div>
      )}
    </AvatarContainer>
  ) : (
    <UploadPlaceholder $isDark={isDarkMode}>
      {uploading || loadingSignedUrl ? (
        <>
          <Spin indicator={<LoadingOutlined spin />} size="small" />
          <span className="text">{loadingSignedUrl ? '加载中...' : `${progress}%`}</span>
        </>
      ) : (
        <>
          <PlusOutlined />
          <span className="text">上传头像</span>
        </>
      )}
    </UploadPlaceholder>
  );

  return (
    <UploadWrapper $size={size} $isDark={isDarkMode}>
      <UploadArea>
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
          disabled={disabled || uploading}
          accept="image/*"
          className="avatar-uploader"
        >
          {uploadContent}
        </Upload>
        {/* 上传进度显示在图片旁边 */}
        {showProgress && (
          <ProgressArea $isDark={isDarkMode}>
            <Progress
              type="circle"
              percent={progress}
              size={50}
              strokeWidth={6}
            />
            <span className="status-text">{getStatusText()}</span>
          </ProgressArea>
        )}
        {/* 错误状态显示在图片旁边 */}
        {showError && (
          <ErrorText>
            <span>上传失败</span>
            <span className="retry-btn" onClick={handleRetry}>
              <ReloadOutlined /> 重试
            </span>
          </ErrorText>
        )}
      </UploadArea>
      <HelpText $isDark={isDarkMode}>
        支持 JPG、PNG、GIF、WebP、SVG、BMP，不超过 {Math.round(maxSize / 1024 / 1024)}MB
      </HelpText>
    </UploadWrapper>
  );
};

export default AvatarUpload;
