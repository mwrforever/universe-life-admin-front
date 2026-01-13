/**
 * 缩略图加载 Hook
 * 实现渐进式图片加载：先加载缩略图，再加载原图
 * 支持自动获取私有桶签名 URL
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateThumbnailUrl } from '@/utils/thumbnail';
import { COSUploadApiService } from '@/services/upload/uploadApi';
import type { ThumbnailSize } from '@/utils/thumbnail';

// 签名 URL 缓存，避免重复请求
const signedUrlCache = new Map<string, { url: string; expireAt: number }>();

export interface UseThumbnailOptions {
  /** 原图 URL 或文件路径（如 uploads/2026/01/12/avatar.jpg） */
  src: string;
  /** 缩略图尺寸 */
  size?: ThumbnailSize;
  /** 是否启用渐进式加载 */
  progressive?: boolean;
  /** 是否预加载原图 */
  preloadOriginal?: boolean;
  /** 是否需要获取签名 URL（私有桶文件需要） */
  needSignedUrl?: boolean;
}

export interface UseThumbnailReturn {
  /** 当前显示的图片 URL */
  currentSrc: string;
  /** 缩略图 URL */
  thumbnailSrc: string;
  /** 原图 URL */
  originalSrc: string;
  /** 是否正在加载缩略图 */
  loadingThumbnail: boolean;
  /** 是否正在加载原图 */
  loadingOriginal: boolean;
  /** 是否有任何加载中 */
  loading: boolean;
  /** 缩略图是否加载失败 */
  thumbnailError: boolean;
  /** 原图是否加载失败 */
  originalError: boolean;
  /** 是否有任何错误 */
  error: boolean;
  /** 是否已加载缩略图 */
  isThumbnailLoaded: boolean;
  /** 是否已加载原图 */
  isOriginalLoaded: boolean;
  /** 重新加载 */
  reload: () => void;
}

/**
 * 预加载图片
 * @param src 图片 URL
 * @returns Promise，成功返回 true，失败返回 false
 */
function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * 判断是否为需要签名的文件路径
 * 如果是相对路径（如 uploads/xxx）而非完整 URL，则需要签名
 */
function needsSignedUrl(src: string): boolean {
  if (!src) return false;
  // blob URL 不需要签名
  if (src.startsWith('blob:')) return false;
  // 已经是完整 URL（http/https 开头）不需要再签名
  if (src.startsWith('http://') || src.startsWith('https://')) return false;
  // 其他情况（相对路径）需要签名
  return true;
}

/**
 * 获取签名 URL（带缓存）
 */
async function getSignedUrl(fileUrl: string): Promise<string | null> {
  // 检查缓存
  const cached = signedUrlCache.get(fileUrl);
  if (cached && cached.expireAt > Date.now() / 1000 + 60) {
    // 缓存有效且还有至少 1 分钟有效期
    return cached.url;
  }

  try {
    const res = await COSUploadApiService.getDownloadToken({ fileUrl });
    if (res.code === 1 && res.data?.expiredUrl) {
      // 缓存签名 URL
      signedUrlCache.set(fileUrl, {
        url: res.data.expiredUrl,
        expireAt: res.data.expireAt,
      });
      return res.data.expiredUrl;
    }
    return null;
  } catch (error) {
    console.error('获取签名 URL 失败:', error);
    return null;
  }
}

/**
 * 缩略图加载 Hook
 * 实现渐进式图片加载策略
 */
export function useThumbnail(options: UseThumbnailOptions): UseThumbnailReturn {
  const {
    src,
    size = 'medium',
    progressive = true,
    preloadOriginal = true,
  } = options;

  // 状态
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [signedSrc, setSignedSrc] = useState<string>('');
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [originalError, setOriginalError] = useState(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  const [isOriginalLoaded, setIsOriginalLoaded] = useState(false);

  // 用于取消加载的 ref
  const mountedRef = useRef(true);
  const loadIdRef = useRef(0);

  // 计算实际使用的 URL
  const actualSrc = signedSrc || src || '';
  const thumbnailSrc = actualSrc ? generateThumbnailUrl(actualSrc, size) : '';
  const originalSrc = actualSrc;

  /**
   * 加载图片
   */
  const loadImages = useCallback(async () => {
    if (!src) {
      setCurrentSrc('');
      setSignedSrc('');
      setLoadingThumbnail(false);
      setLoadingOriginal(false);
      setThumbnailError(false);
      setOriginalError(false);
      setIsThumbnailLoaded(false);
      setIsOriginalLoaded(false);
      return;
    }

    // 生成新的加载 ID，用于取消旧的加载
    const currentLoadId = ++loadIdRef.current;

    // 重置状态
    setThumbnailError(false);
    setOriginalError(false);
    setIsThumbnailLoaded(false);
    setIsOriginalLoaded(false);

    // 如果需要签名 URL，先获取
    let finalSrc = src;
    if (needsSignedUrl(src)) {
      setLoadingThumbnail(true);
      const signed = await getSignedUrl(src);
      
      // 检查是否已取消
      if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;
      
      if (signed) {
        finalSrc = signed;
        setSignedSrc(signed);
      } else {
        // 获取签名失败
        setLoadingThumbnail(false);
        setThumbnailError(true);
        setOriginalError(true);
        return;
      }
    }

    // 生成缩略图和原图 URL
    const thumbUrl = generateThumbnailUrl(finalSrc, size);
    const origUrl = finalSrc;

    if (progressive) {
      // 渐进式加载：先加载缩略图
      setLoadingThumbnail(true);
      const thumbnailSuccess = await preloadImage(thumbUrl);

      // 检查是否已取消
      if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;

      setLoadingThumbnail(false);

      if (thumbnailSuccess) {
        setIsThumbnailLoaded(true);
        setCurrentSrc(thumbUrl);
      } else {
        setThumbnailError(true);
      }

      // 加载原图
      if (preloadOriginal) {
        setLoadingOriginal(true);
        const originalSuccess = await preloadImage(origUrl);

        // 检查是否已取消
        if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;

        setLoadingOriginal(false);

        if (originalSuccess) {
          setIsOriginalLoaded(true);
          setCurrentSrc(origUrl);
        } else {
          setOriginalError(true);
          // 如果原图加载失败但缩略图成功，保持显示缩略图
        }
      }
    } else {
      // 非渐进式：直接加载原图
      setLoadingOriginal(true);
      const originalSuccess = await preloadImage(origUrl);

      // 检查是否已取消
      if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;

      setLoadingOriginal(false);

      if (originalSuccess) {
        setIsOriginalLoaded(true);
        setCurrentSrc(origUrl);
      } else {
        setOriginalError(true);
      }
    }
  }, [src, size, progressive, preloadOriginal]);

  /**
   * 重新加载
   */
  const reload = useCallback(() => {
    loadImages();
  }, [loadImages]);

  // 监听 src 变化
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 组件卸载时标记
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    currentSrc,
    thumbnailSrc,
    originalSrc,
    loadingThumbnail,
    loadingOriginal,
    loading: loadingThumbnail || loadingOriginal,
    thumbnailError,
    originalError,
    error: thumbnailError && originalError,
    isThumbnailLoaded,
    isOriginalLoaded,
    reload,
  };
}

export default useThumbnail;
