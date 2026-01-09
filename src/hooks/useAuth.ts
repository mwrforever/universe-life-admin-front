/**
 * 认证状态管理Hook
 * 提供统一的认证状态管理和操作方法（前后端分离表单认证版本）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TokenManager } from '@/services/auth/tokenManager';
import authApi from '@/services/auth/authApi';
import type { UserInfo } from '@/services/auth/tokenManager';
import { authLogger } from '@/utils/logger';

export interface UseAuthReturn {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用 ref 来跟踪是否已经初始化，避免重复检查
  const isInitialized = useRef(false);
  const isChecking = useRef(false);

  // ✅ 优化：基于token判断认证状态，而不是user
  const isAuthenticated = TokenManager.isLoggedIn();

  const refreshUser = useCallback(() => {
    try {
      const currentUser = TokenManager.getUserInfo();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户信息失败');
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        // ✅ 调用OAuth2撤销流程（已改造authApi.logout）
        await authApi.logout();
        authLogger.info('✅ OAuth2 Token撤销成功');
      } catch (err) {
        authLogger.warn('⚠️ OAuth2 Token撤销失败，继续清理本地数据');
      }

      TokenManager.clearTokens();
      setUser(null);
      authLogger.info('✅ 本地登出完成，跳转到登录页');
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : '登出失败');
      TokenManager.clearTokens();
      setUser(null);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    // 防止并发检查
    if (isChecking.current) {
      authLogger.debug('⏸️ 正在检查认证状态，跳过重复检查');
      return;
    }

    // 如果已经检查过一次，且没有新的状态变化，则跳过
    if (isInitialized.current && !isChecking.current) {
      authLogger.debug('✅ 已完成初始化检查，跳过重复检查');
      return;
    }

    try {
      isChecking.current = true;
      setIsLoading(true);

      const hasToken = TokenManager.isLoggedIn();

      if (hasToken) {
        // 直接获取用户信息
        const currentUser = TokenManager.getUserInfo();
        setUser(currentUser);
        setError(null);
      } else {
        // 尝试使用refresh token刷新
        const refreshTokenValue = TokenManager.getRefreshToken();
        if (refreshTokenValue) {
          authLogger.info('🔄 Access Token已过期，尝试刷新...');
          try {
            const response = await authApi.refreshToken(refreshTokenValue) as any;
            if (response.code === 1 && response.data) {
              TokenManager.saveLoginData(response.data);
              authLogger.info('✅ Token刷新成功');
              const currentUser = TokenManager.getUserInfo();
              setUser(currentUser);
              setError(null);
            } else {
              setUser(null);
            }
          } catch (err) {
            authLogger.warn('⚠️ Token刷新失败');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查认证状态失败');
      setUser(null);
    } finally {
      setIsLoading(false);
      isChecking.current = false;
      isInitialized.current = true;
    }
  }, []);

  // ✅ 优化：只在其他标签页修改时才响应，避免同一页面的重复检查
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 只在其他标签页修改 localStorage 时才响应
      if ((e.key === 'universe_access_token' || e.key === 'universe_user_info') && e.newValue !== e.oldValue) {
        // 重置初始化状态，允许重新检查
        isInitialized.current = false;
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  // ✅ 优化：页面重新可见时不自动重新检查，避免不必要的渲染
  // 移除了visibilitychange监听器
  // ✅ 优化：移除定时刷新逻辑，改为在请求前检查token是否过期

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated, // ✅ 直接返回基于token的认证状态
    isLoading,
    error,
    logout,
    refreshUser,
  };
};

export default useAuth;
