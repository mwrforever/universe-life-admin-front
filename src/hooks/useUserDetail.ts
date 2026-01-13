/**
 * 用户详情 Hook
 * 用于在编辑弹窗中加载用户详情数据
 * 
 * 功能：
 * - 按用户 ID 获取详情
 * - 支持加载状态和错误处理
 * - 支持手动重新加载
 * - 支持启用/禁用控制
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { userDetailApi } from '@/services/system';
import type { UserDetailVO } from '@/services/system/userDetailApi';

export interface UseUserDetailOptions {
  /** 用户 ID */
  userId: string | null;
  /** 是否启用（默认 true） */
  enabled?: boolean;
}

export interface UseUserDetailReturn {
  /** 用户详情数据 */
  detail: UserDetailVO | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 重新加载 */
  reload: () => void;
}

/**
 * 用户详情 Hook
 */
export function useUserDetail(options: UseUserDetailOptions): UseUserDetailReturn {
  const { userId, enabled = true } = options;

  const [detail, setDetail] = useState<UserDetailVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 用于取消请求的 ref
  const mountedRef = useRef(true);
  const loadIdRef = useRef(0);

  /**
   * 加载用户详情
   */
  const loadDetail = useCallback(async () => {
    // 如果未启用或没有用户 ID，不加载
    if (!enabled || !userId) {
      setDetail(null);
      setLoading(false);
      setError(null);
      return;
    }

    // 生成新的加载 ID，用于取消旧的加载
    const currentLoadId = ++loadIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const res = await userDetailApi.getUserDetail(userId) as any;
      
      // 检查是否已取消
      if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;

      if (res.code === 1 && res.data) {
        setDetail(res.data);
      } else {
        setError(new Error(res.message || '获取用户详情失败'));
      }
    } catch (err) {
      // 检查是否已取消
      if (!mountedRef.current || loadIdRef.current !== currentLoadId) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('获取用户详情失败:', error);
    } finally {
      // 检查是否已取消
      if (mountedRef.current && loadIdRef.current === currentLoadId) {
        setLoading(false);
      }
    }
  }, [userId, enabled]);

  /**
   * 重新加载
   */
  const reload = useCallback(() => {
    loadDetail();
  }, [loadDetail]);

  // 监听 userId 和 enabled 变化
  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // 组件卸载时标记
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    detail,
    loading,
    error,
    reload,
  };
}

export default useUserDetail;
