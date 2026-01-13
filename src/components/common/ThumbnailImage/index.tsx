/**
 * 缩略图图片组件
 * 实现渐进式加载：先显示缩略图，再过渡到原图
 */

import React, { useMemo } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined, PictureOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useThumbnail } from '@/hooks/useThumbnail';
import type { ThumbnailSize } from '@/utils/thumbnail';

export interface ThumbnailImageProps {
  /** 原图 URL 或文件 ID */
  src: string;
  /** 图片替代文本 */
  alt?: string;
  /** 缩略图尺寸 */
  thumbnailSize?: ThumbnailSize;
  /** 图片宽度 */
  width?: number | string;
  /** 图片高度 */
  height?: number | string;
  /** 是否为圆形 */
  circle?: boolean;
  /** 加载失败时的占位图 */
  fallback?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击事件 */
  onClick?: () => void;
  /** 是否启用渐进式加载 */
  progressive?: boolean;
  /** 对象适应方式 */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

interface ImageContainerProps {
  $width?: number | string;
  $height?: number | string;
  $circle?: boolean;
  $clickable?: boolean;
}

const ImageContainer = styled.div<ImageContainerProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: ${props => (typeof props.$width === 'number' ? `${props.$width}px` : props.$width || 'auto')};
  height: ${props => (typeof props.$height === 'number' ? `${props.$height}px` : props.$height || 'auto')};
  border-radius: ${props => (props.$circle ? '50%' : '4px')};
  background-color: #f5f5f5;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};
  transition: all 0.3s ease;

  &:hover {
    ${props => props.$clickable && 'opacity: 0.9;'}
  }
`;

interface StyledImageProps {
  $loaded: boolean;
  $objectFit?: string;
}

const StyledImage = styled.img<StyledImageProps>`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  opacity: ${props => (props.$loaded ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #bfbfbf;
  font-size: 24px;
`;

const LoadingPlaceholder = styled(Placeholder)`
  background-color: #fafafa;
`;

const ErrorPlaceholder = styled(Placeholder)`
  background-color: #f5f5f5;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #999;

  .anticon {
    font-size: 24px;
    color: #d9d9d9;
  }
`;

/**
 * 缩略图图片组件
 */
export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt = '',
  thumbnailSize = 'medium',
  width,
  height,
  circle = false,
  fallback,
  className,
  style,
  onClick,
  progressive = true,
  objectFit = 'cover',
}) => {
  const {
    currentSrc,
    loading,
    error,
    isOriginalLoaded,
    isThumbnailLoaded,
  } = useThumbnail({
    src,
    size: thumbnailSize,
    progressive,
    preloadOriginal: true,
  });

  // 是否显示图片
  const showImage = currentSrc && (isThumbnailLoaded || isOriginalLoaded);
  // 是否显示加载中
  const showLoading = loading && !showImage;
  // 是否显示错误
  const showError = error && !showImage;

  // 默认错误占位
  const defaultFallback = useMemo(
    () => (
      <ErrorPlaceholder>
        <PictureOutlined />
        <span>加载失败</span>
      </ErrorPlaceholder>
    ),
    []
  );

  return (
    <ImageContainer
      $width={width}
      $height={height}
      $circle={circle}
      $clickable={!!onClick}
      className={className}
      style={style}
      onClick={onClick}
    >
      {/* 加载中占位 */}
      {showLoading && (
        <LoadingPlaceholder>
          <Spin indicator={<LoadingOutlined spin />} />
        </LoadingPlaceholder>
      )}

      {/* 错误占位 */}
      {showError && (fallback || defaultFallback)}

      {/* 图片 */}
      {showImage && (
        <StyledImage
          src={currentSrc}
          alt={alt}
          $loaded={showImage}
          $objectFit={objectFit}
        />
      )}

      {/* 空状态占位 */}
      {!src && !showLoading && (
        <Placeholder>
          <PictureOutlined />
        </Placeholder>
      )}
    </ImageContainer>
  );
};

export default ThumbnailImage;
