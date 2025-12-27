/**
 * 认证状态管理Hook
 * 提供统一的认证状态管理和操作方法（前后端分离表单认证版本）
 */

import { useState, useEffect, useCallback } from 'react';
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
        await authApi.logout();
        authLogger.info('✅ 服务端登出成功');
      } catch (err) {
        authLogger.warn('⚠️ 服务端登出失败，继续清理本地数据');
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
    try {
      const isAuthenticated = TokenManager.isLoggedIn();
      if (isAuthenticated) {
        refreshUser();
        setIsLoading(false);
        return;
      }

      const refreshTokenValue = TokenManager.getRefreshToken();
      if (refreshTokenValue) {
        authLogger.info('🔄 Access Token已过期，尝试刷新...');
        try {
          const response = await authApi.refreshToken(refreshTokenValue) as any;
          if (response.code === 1 && response.data) {
            TokenManager.saveLoginData(response.data);
            authLogger.info('✅ Token刷新成功');
            refreshUser();
            setIsLoading(false);
            return;
          }
        } catch (err) {
          authLogger.warn('⚠️ Token刷新失败');
        }
      }

      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查认证状态失败');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'universe_access_token' || e.key === 'universe_user_info') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuthStatus]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (TokenManager.isLoggedIn() && TokenManager.isTokenExpiringSoon()) {
        const refreshTokenValue = TokenManager.getRefreshToken();
        if (refreshTokenValue) {
          try {
            const response = await authApi.refreshToken(refreshTokenValue) as any;
            if (response.code === 1 && response.data) {
              TokenManager.saveLoginData(response.data);
              authLogger.info('✅ Token自动刷新成功');
            }
          } catch (err) {
            authLogger.warn('⚠️ Token自动刷新失败');
          }
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    logout,
    refreshUser,
  };
};

export default useAuth;
