/**
 * 头像签名 Hook
 * 
 * 用于按需获取签名后的头像URL
 * - 检查原始key是否需要签名
 * - 检查缓存是否过期
 * - 自动刷新过期的签名URL
 */

import { useState, useEffect, useCallback } from 'react';
import { getSignedUrl, needsSignedUrl, isSignedUrlExpired, getCachedSignedUrl } from '@/utils/signedUrl';

export interface UseSignedAvatarReturn {
  /** 签名后的头像URL，可直接用于img src */
  signedUrl: string | null;
  /** 是否正在加载签名URL */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新签名URL */
  refresh: () => Promise<void>;
}

/**
 * 头像签名 Hook
 * @param originalKey 原始头像key（未签名的COS路径）
 * @returns 签名URL、加载状态、错误信息和刷新方法
 */
export const useSignedAvatar = (originalKey: string | undefined | null): UseSignedAvatarReturn => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取签名URL
   * 1. 如果不需要签名，直接返回原值
   * 2. 如果缓存有效，使用缓存
   * 3. 否则调用API获取新签名
   */
  const fetchSignedUrl = useCallback(async () => {
    // 空值处理
    if (!originalKey) {
      setSignedUrl(null);
      setError(null);
      return;
    }

    // 不需要签名的URL直接返回
    if (!needsSignedUrl(originalKey)) {
      setSignedUrl(originalKey);
      setError(null);
      return;
    }

    // 检查缓存是否有效
    if (!isSignedUrlExpired(originalKey)) {
      const cached = getCachedSignedUrl(originalKey);
      if (cached) {
        setSignedUrl(cached.url);
        setError(null);
        return;
      }
    }

    // 需要获取新签名
    setIsLoading(true);
    setError(null);

    try {
      const url = await getSignedUrl(originalKey);
      setSignedUrl(url);
    } catch (err) {
      console.error('获取头像签名URL失败:', err);
      setError(err instanceof Error ? err.message : '获取签名URL失败');
      setSignedUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [originalKey]);

  /**
   * 手动刷新签名URL
   */
  const refresh = useCallback(async () => {
    await fetchSignedUrl();
  }, [fetchSignedUrl]);

  // 当 originalKey 变化时自动获取签名URL
  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl]);

  return {
    signedUrl,
    isLoading,
    error,
    refresh,
  };
};

export default useSignedAvatar;
