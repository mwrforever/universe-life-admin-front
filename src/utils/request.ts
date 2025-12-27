/**
 * HTTP 请求工具
 * 基于 axios 封装，支持前后端分离表单认证
 */

import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenManager } from '@/services/auth/tokenManager';
import authApi from '@/services/auth/authApi';
import { httpLogger } from '@/utils/logger';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  async (config) => {
    let token = TokenManager.getAccessToken();

    if (!token) {
      const refreshTokenValue = TokenManager.getRefreshToken();
      if (refreshTokenValue && !isRefreshing) {
        httpLogger.info('🔄 请求拦截器: Access Token已过期，尝试刷新...');
        isRefreshing = true;
        try {
          const response = await authApi.refreshToken(refreshTokenValue) as any;
          if (response.code === 1 && response.data) {
            TokenManager.saveLoginData(response.data);
            token = response.data.access_token;
            httpLogger.info('✅ 请求拦截器: Token刷新成功');
          }
        } catch (err) {
          httpLogger.error('❌ 请求拦截器: Token刷新失败', err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = TokenManager.getRefreshToken();
        if (refreshTokenValue) {
          const response = await authApi.refreshToken(refreshTokenValue) as any;
          if (response.code === 1 && response.data) {
            TokenManager.saveLoginData(response.data);
            const newToken = response.data.access_token;
            onTokenRefreshed(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return request(originalRequest);
          }
        }
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        httpLogger.error('Token刷新失败:', refreshError);
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 403:
          httpLogger.error('没有权限访问该资源');
          break;
        case 404:
          httpLogger.error('请求的资源不存在');
          break;
        case 500:
          httpLogger.error('服务器内部错误');
          break;
        default:
          httpLogger.error('请求失败:', error.message);
      }
    } else if (error.request) {
      httpLogger.error('网络错误，请检查您的网络连接');
    } else {
      httpLogger.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export const get = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.get<T>(url, config);
};

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.post<T>(url, data, config);
};

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return request.put<T>(url, data, config);
};

export const del = <T = any>(url: string, config?: AxiosRequestConfig) => {
  return request.delete<T>(url, config);
};

export default request;
