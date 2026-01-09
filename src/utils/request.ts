/**
 * HTTP 请求工具
 * 基于 axios 封装，支持前后端分离表单认证
 * 错误响应规范: api/error-response.md
 */

import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenManager } from '@/services/auth/tokenManager';
import authApi from '@/services/auth/authApi';
import { httpLogger } from '@/utils/logger';
import { message } from 'antd';

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  // @ts-ignore
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8101',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  async (config) => {
    // 获取token（会自动检查是否过期）
    let token = TokenManager.getAccessToken();

    // 如果token不存在或已过期，尝试使用refresh token刷新
    if (!token) {
      const refreshTokenValue = TokenManager.getRefreshToken();

      // 只有存在refresh token时才尝试刷新
      if (refreshTokenValue && !isRefreshing) {
        httpLogger.info('🔄 请求拦截器: Access Token已过期，尝试刷新...');
        isRefreshing = true;

        try {
          const response = await authApi.refreshToken(refreshTokenValue) as any;
          if (response && response.data) {
            TokenManager.saveLoginData(response.data);
            token = response.data.accessToken;
            httpLogger.info('✅ 请求拦截器: Token刷新成功');
          }
        } catch (err) {
          httpLogger.error('❌ 请求拦截器: Token刷新失败', err);
          // Token刷新失败，清除所有tokens
          TokenManager.clearTokens();
        } finally {
          isRefreshing = false;
        }
      } else if (!refreshTokenValue) {
        // 没有refresh token，清除可能存在的无效数据
        httpLogger.warn('⚠️ 请求拦截器: 没有可用的Refresh Token');
        TokenManager.clearTokens();
      }
    }

    // 设置Authorization头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 处理业务错误码
 * 根据 api/error-response.md 规范:
 * - code = 1: 成功
 * - code = 401: 认证失败
 * - code = 403: 权限不足
 * - code = 其它: 其它错误
 */
const handleBusinessError = (data: any, response: AxiosResponse) => {
  const { code, message: msg } = data;

  // 业务成功
  if (code === 1) {
    httpLogger.info('✅ 业务成功，返回完整响应:', data);
    return data;
  }

  // 认证失败 - 清除token并跳转登录
  if (code === 401) {
    httpLogger.warn('⚠️ 业务错误: 认证失败 -', msg);
    TokenManager.clearTokens();

    // 如果不在登录页，才跳转
    if (window.location.pathname !== '/login') {
      message.error('认证失败，请重新登录');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }

    return Promise.reject({ code, message: msg });
  }

  // 权限不足
  if (code === 403) {
    httpLogger.warn('⚠️ 业务错误: 权限不足 -', msg);
    message.error(msg || '权限不足，无法访问该资源');
    return Promise.reject({ code, message: msg });
  }

  // 其它业务错误
  httpLogger.error('❌ 业务错误:', msg);
  message.error(msg || '操作失败');
  return Promise.reject({ code, message: msg });
};

request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 处理业务错误码（响应体中的 code 字段）
    const { data } = response;

    // 检查是否有业务错误码结构
    if (data && typeof data === 'object' && 'code' in data) {
      return handleBusinessError(data, response);
    }

    // 如果没有标准业务错误码结构，直接返回数据
    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 处理 HTTP 401 错误
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          // @ts-ignore
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }

      // 标记为重试请求，避免无限循环
      originalRequest._retry = true;
      isRefreshing = true;

      // 检查是否存在refresh token
      const refreshTokenValue = TokenManager.getRefreshToken();

      if (!refreshTokenValue) {
        // 没有refresh token，清除数据并跳转登录
        httpLogger.warn('⚠️ 响应拦截器: 没有可用的Refresh Token');
        TokenManager.clearTokens();
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(error);
      }

      // 存在refresh token，尝试刷新
      try {
        httpLogger.info('🔄 响应拦截器: HTTP 401，尝试刷新Token...');
        const response = await authApi.refreshToken(refreshTokenValue) as any;

        if (response && response.data) {
          TokenManager.saveLoginData(response.data);
          const newToken = response.data.accessToken;
          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          httpLogger.info('✅ 响应拦截器: Token刷新成功，重试请求');
          return request(originalRequest);
        }
      } catch (refreshError) {
        httpLogger.error('❌ 响应拦截器: Token刷新失败', refreshError);
        TokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 处理其它 HTTP 错误
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 403:
          httpLogger.error('❌ HTTP错误: 权限不足');
          message.error('权限不足，无法访问该资源');
          break;
        case 404:
          httpLogger.error('❌ HTTP错误: 资源不存在');
          message.error('请求的资源不存在');
          break;
        case 500:
          httpLogger.error('❌ HTTP错误: 服务器内部错误');
          message.error('服务器内部错误，请稍后重试');
          break;
        case 503:
          httpLogger.error('❌ HTTP错误: 服务暂不可用');
          message.error('服务暂不可用，请稍后重试');
          break;
        default:
          httpLogger.error(`❌ HTTP错误: ${status} -`, error.message);
          message.error(error.message || '请求失败');
      }
    } else if (error.request) {
      // 网络错误
      httpLogger.error('❌ 网络错误: 请检查您的网络连接');
      message.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置错误
      httpLogger.error('❌ 请求配置错误:', error.message);
      message.error('请求配置错误');
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
