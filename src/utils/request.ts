/**
 * HTTP 请求工具
 * 基于 axios 封装
 *
 * 第一层（拦截器）：检查 HTTP 状态码
 * - 401 → 刷新 token
 * - 403 → 提示权限不足
 * - 其它 → 返回 response.data 给业务层
 *
 * 第二层（业务层）：检查 data.code
 * - code = 1 → 成功
 * - code = 0 → 显示错误提示
 */

import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenManager } from '@/services/auth/tokenManager';
import authApi from '@/services/auth/authApi';
import { httpLogger } from '@/utils/logger';
import { showErrorMessage } from '@/utils/antdStatic';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8101/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
request.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// 响应拦截器：第一层处理 HTTP 状态码
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    const skipNotification = response.config?.skipErrorNotification ?? false;

    // HTTP 2xx 成功，检查业务码
    if (data && typeof data === 'object' && 'code' in data) {
      const { code, message: msg } = data;
      
      // 业务码为 1 才算成功
      if (code === 1) {
        return data;
      }
      
      // 业务码不为 1（如 0），显示错误并 reject
      if (!skipNotification) {
        showErrorMessage(msg || '操作失败');
      }
      return Promise.reject({ code, message: msg });
    }

    // 没有业务码结构，直接返回
    return data;
  },
  async (error) => {
    const { response, config: originalRequest } = error;
    const skipNotification = originalRequest?.skipErrorNotification ?? false;

    if (!response) {
      // 网络错误
      if (!skipNotification) {
        showErrorMessage('网络连接失败，请检查网络设置');
      }
      return Promise.reject(error);
    }

    const { status, data } = response;

    // HTTP 401：刷新 token 逻辑
    if (status === 401) {
      return handle401Error(response, originalRequest);
    }

    // HTTP 403：权限不足
    if (status === 403) {
      if (!skipNotification) {
        showErrorMessage('您无此操作权限，请联系管理员');
      }
      return Promise.reject({ code: 403, message: '权限不足' });
    }

    // 其它 HTTP 错误（如 500）：检查业务码
    if (data && typeof data === 'object' && 'code' in data) {
      const { code, message: msg } = data;
      
      console.log('🔴 HTTP错误，业务码:', code, '消息:', msg);
      
      // 业务码为 1 才算成功
      if (code === 1) {
        return data;
      }
      
      // 业务码不为 1（如 0），显示错误并 reject
      if (!skipNotification) {
        console.log('🔴 准备显示错误提示:', msg);
        showErrorMessage(msg || '操作失败');
      }
      return Promise.reject({ code, message: msg });
    }

    // 无响应体的 HTTP 错误
    const errorMsg = getHttpErrorMessage(status);
    if (!skipNotification) {
      showErrorMessage(errorMsg);
    }
    return Promise.reject({ code: status, message: errorMsg });
  }
);


/**
 * 处理 HTTP 401：刷新 token
 * 
 * 关键设计：
 * 1. 使用 refreshPromise 确保同一时间只有一个刷新请求
 * 2. 所有并发的 401 请求都等待同一个 Promise
 * 3. 刷新成功后，所有等待的请求使用新 token 重试
 * 4. 刷新失败后，所有等待的请求都被拒绝
 */
async function handle401Error(_response: AxiosResponse, originalRequest: any): Promise<any> {
  // 如果已经是重试请求，说明新 token 也无效，直接跳转登录
  if (originalRequest._retry) {
    httpLogger.warn('⚠️ 重试请求仍然返回 401，跳转登录页');
    TokenManager.clearTokens();
    redirectToLogin();
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
  }

  // 标记为重试请求，防止无限循环
  originalRequest._retry = true;

  // 如果正在刷新，等待刷新完成
  if (isRefreshing && refreshPromise) {
    httpLogger.info('⏳ 等待正在进行的 Token 刷新...');
    return refreshPromise.then((newToken) => {
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return request(originalRequest);
      }
      return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
    });
  }

  const refreshTokenValue = TokenManager.getRefreshToken();

  if (!refreshTokenValue) {
    httpLogger.warn('⚠️ 没有 Refresh Token，跳转登录页');
    TokenManager.clearTokens();
    redirectToLogin();
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
  }

  // 开始刷新流程
  isRefreshing = true;
  httpLogger.info('🔄 开始刷新 Token...');

  // 创建刷新 Promise，让所有并发请求共享
  refreshPromise = doRefreshToken(refreshTokenValue);

  try {
    const newToken = await refreshPromise;
    
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return request(originalRequest);
    }
    
    // 刷新失败
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
  } finally {
    // 重置状态
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * 执行 Token 刷新
 * @returns 新的 access token，失败返回 null
 */
async function doRefreshToken(refreshTokenValue: string): Promise<string | null> {
  try {
    const refreshResponse = await authApi.refreshToken(refreshTokenValue) as any;
    
    if (refreshResponse?.data?.accessToken) {
      // 注意：OAuth2Service.refreshAccessToken 已经存储了 token
      // 这里不需要再调用 saveLoginData，避免重复存储
      const newToken = refreshResponse.data.accessToken;
      httpLogger.info('✅ Token 刷新成功');
      return newToken;
    }
    
    httpLogger.error('❌ Token 刷新响应无效');
    TokenManager.clearTokens();
    redirectToLogin();
    return null;
  } catch (error) {
    httpLogger.error('❌ Token 刷新失败:', error);
    TokenManager.clearTokens();
    redirectToLogin();
    return null;
  }
}

/**
 * 跳转到登录页（防止重复跳转）
 */
function redirectToLogin(): void {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    503: '服务暂不可用',
  };
  return messages[status] || '请求失败';
}


/**
 * 业务层辅助函数：处理 API 响应
 * 检查 data.code，code=1 成功，code=0 显示错误
 */
export function handleApiResponse<T>(data: { code: number; message: string; data: T }): T {
  if (data.code === 1) {
    return data.data;
  }
  // code = 0 或其它，显示错误
  showErrorMessage(data.message || '操作失败');
  throw { code: data.code, message: data.message };
}

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
