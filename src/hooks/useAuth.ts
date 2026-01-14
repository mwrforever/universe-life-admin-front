/**
 * 认证状态管理Hook
 * 提供统一的认证状态管理和操作方法
 * Token 刷新逻辑已委托给 TokenRefreshService
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TokenManager } from '@/services/auth/tokenManager';
import { TokenRefreshService } from '@/services/auth/tokenRefreshService';
import authApi from '@/services/auth/authApi';
import { sysUserProfileApi } from '@/services/system';
import type { UserInfo, UserProfile } from '@/services/auth/tokenManager';
import { authLogger } from '@/utils/logger';

// 节流时间（毫秒）
const REFRESH_THROTTLE_MS = 5000;

export interface UseAuthReturn {
  user: UserInfo | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => void;
  refreshProfile: () => Promise<void>;
  isRefreshing: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 使用 ref 来跟踪是否已经初始化，避免重复检查
  const isInitialized = useRef(false);
  const isChecking = useRef(false);
  // 节流：记录上次刷新时间
  const lastRefreshTime = useRef(0);

  // 基于 token 判断认证状态
  const isAuthenticated = TokenManager.isLoggedIn();

  const refreshUser = useCallback(() => {
    try {
      const currentUser = TokenManager.getUserInfo();
      const currentProfile = TokenManager.getUserProfile();
      setUser(currentUser);
      setProfile(currentProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户信息失败');
      setUser(null);
      setProfile(null);
    }
  }, []);

  /**
   * 刷新用户资料（带节流）
   * 从服务器重新获取最新资料并更新缓存
   */
  const refreshProfile = useCallback(async () => {
    // 节流检查
    const now = Date.now();
    if (now - lastRefreshTime.current < REFRESH_THROTTLE_MS) {
      authLogger.info('⏳ 刷新请求被节流，请稍后再试');
      return;
    }
    lastRefreshTime.current = now;

    if (!TokenManager.isLoggedIn()) {
      return;
    }

    setIsRefreshing(true);
    try {
      const res = await sysUserProfileApi.getPersonProfile();
      if (res.code === 1 && res.data) {
        TokenManager.setUserProfile(res.data);
        setProfile(res.data);
        setUser({
          employeeNo: res.data.employeeNo,
          userAvatar: res.data.avatarUrl || '',
        });
        authLogger.info('✅ 用户资料已刷新');
      }
    } catch (err) {
      authLogger.error('❌ 刷新用户资料失败:', err);
      setError(err instanceof Error ? err.message : '刷新用户资料失败');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        await authApi.logout();
        authLogger.info('✅ Token 撤销成功');
      } catch (err) {
        authLogger.warn('⚠️ Token 撤销失败，继续清理本地数据');
      }

      TokenManager.clearTokens();
      setUser(null);
      setProfile(null);
      authLogger.info('✅ 本地登出完成，跳转到登录页');
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : '登出失败');
      TokenManager.clearTokens();
      setUser(null);
      setProfile(null);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  }, []);


  /**
   * 检查认证状态
   * 使用 TokenRefreshService.getValidToken() 进行懒加载检查
   */
  const checkAuthStatus = useCallback(async () => {
    // 防止并发检查
    if (isChecking.current) {
      return;
    }

    // 如果已经检查过一次，跳过
    if (isInitialized.current) {
      return;
    }

    try {
      isChecking.current = true;
      setIsLoading(true);

      // 使用 TokenRefreshService 获取有效 token（懒加载模式）
      const validToken = await TokenRefreshService.getValidToken();

      if (validToken) {
        // 有有效 token，获取缓存的用户信息
        const currentUser = TokenManager.getUserInfo();
        const currentProfile = TokenManager.getUserProfile();
        setUser(currentUser);
        setProfile(currentProfile);
        setError(null);

        // 如果没有用户资料缓存，尝试获取
        if (!currentProfile) {
          await refreshProfile();
        }
      } else {
        // 无有效 token（TokenRefreshService 已处理跳转）
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '检查认证状态失败');
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
      isChecking.current = false;
      isInitialized.current = true;
    }
  }, [refreshProfile]);

  // 响应 storage 事件（包括同一页面和其他标签页）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'universe_user_info' || e.key === 'universe_user_profile') {
        refreshUser();
      } else if (e.key === 'universe_access_token' && e.newValue !== e.oldValue) {
        isInitialized.current = false;
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthStatus, refreshUser]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    logout,
    refreshUser,
    refreshProfile,
    isRefreshing,
  };
};

export default useAuth;
