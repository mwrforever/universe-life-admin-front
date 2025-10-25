/**
 * 认证状态管理hook
 */

import React, { useState, useCallback, useEffect } from 'react';
import { LoginResponse, LoginCredentials, LoginMethod } from '../types/Login.types';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { validateLoginForm } from '../utils/validators';

interface UseAuthOptions {
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: string) => void;
}

interface UseAuthReturn {
  login: (credentials: LoginCredentials, method: LoginMethod) => Promise<LoginResponse>;
  register: (userData: any) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAuth = (options: UseAuthOptions = {}): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError } = options;

  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 通用请求处理
  const handleRequest = useCallback(async (
    endpoint: string,
    data: any,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || ERROR_MESSAGES.SERVER_ERROR);
      }

      if (responseData.success) {
        // 保存token到localStorage
        if (responseData.token) {
          localStorage.setItem('auth_token', responseData.token);
        }
        if (responseData.refreshToken) {
          localStorage.setItem('refresh_token', responseData.refreshToken);
        }
        if (responseData.user) {
          localStorage.setItem('user_info', JSON.stringify(responseData.user));
        }

        onSuccess?.(responseData);
        return responseData;
      } else {
        throw new Error(responseData.message || ERROR_MESSAGES.SERVER_ERROR);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      onError?.(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // 密码登录
  const login = useCallback(async (
    credentials: LoginCredentials,
    method: LoginMethod
  ): Promise<LoginResponse> => {
    // 验证表单数据
    const validation = validateLoginForm({ credentials, validation: {}, agreementAccepted: true, isSubmitting: false, method }, method);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(', ');
      setError(errorMessage);
      onError?.(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    const endpoint = method === 'password' ? API_ENDPOINTS.LOGIN_PASSWORD : API_ENDPOINTS.LOGIN_OTP;
    return handleRequest(endpoint, credentials);
  }, [handleRequest, onError]);

  // 注册
  const register = useCallback(async (userData: any): Promise<LoginResponse> => {
    // 这里可以实现注册逻辑
    return handleRequest('/api/auth/register', userData);
  }, [handleRequest]);

  // 登出
  const logout = useCallback(async (): Promise<void> => {
    try {
      // 调用登出API
      await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  }, []);

  // 检查登录状态
  const checkAuthStatus = useCallback((): {
    isAuthenticated: boolean;
    user: any;
    token: string | null;
  } => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');

    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    try {
      const user = userInfo ? JSON.parse(userInfo) : null;
      return {
        isAuthenticated: true,
        user,
        token,
      };
    } catch {
      // 如果解析失败，清除无效数据
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
  }, []);

  // 刷新token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        return true;
      } else {
        // 刷新失败，清除token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  }, []);

  // 发送验证码
  const sendVerificationCode = useCallback(async (
    identifier: string,
    type: 'sms' | 'email' = 'sms'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || SUCCESS_MESSAGES.CODE_SENT,
        };
      } else {
        return {
          success: false,
          message: data.message || ERROR_MESSAGES.SERVER_ERROR,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }, []);

  // 验证验证码
  const verifyCode = useCallback(async (
    identifier: string,
    code: string
  ): Promise<{ success: boolean; message: string; token?: string }> => {
    try {
      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          code,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        return {
          success: true,
          message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.message || ERROR_MESSAGES.INVALID_CODE,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }, []);

  return {
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
    checkAuthStatus,
    refreshToken,
    sendVerificationCode,
    verifyCode,
  };
};

// 用户信息hook
export const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateUser = useCallback((newUser: any) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user_info', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user_info');
    }
  }, []);

  const loadUser = useCallback(() => {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.warn('Failed to load user info:', error);
      localStorage.removeItem('user_info');
    }
  }, []);

  // 初始化时加载用户信息
  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    user,
    updateUser,
    loadUser,
    isLoading,
  };
};