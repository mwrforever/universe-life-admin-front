/**
 * HTTP 请求工具
 * 基于 axios 封装
 *
 * 第一层（拦截器）：检查 HTTP 状态码
 * - 401 → 委托 TokenRefreshService 处理
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
import { TokenRefreshService } from '@/services/auth/tokenRefreshService';
import { httpLogger } from '@/utils/logger';
import { showErrorMessage } from '@/utils/antdStatic';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8101/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token（同步获取，不在此处刷新）
request.interceptors.request.use(
  (config) => {
    // 直接获取当前 token，不触发刷新
    // 刷新逻辑由 401 响应处理
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理 HTTP 状态码
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

    // HTTP 401：委托 TokenRefreshService 处理
    if (status === 401) {
      return handle401Error(originalRequest);
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

    // 无响应体的 HTTP 错误
    const errorMsg = getHttpErrorMessage(status);
    if (!skipNotification) {
      showErrorMessage(errorMsg);
    }
    return Promise.reject({ code: status, message: errorMsg });
  }
);

/**
 * 处理 HTTP 401：委托 TokenRefreshService
 */
async function handle401Error(originalRequest: any): Promise<any> {
  // 如果已经是重试请求，说明新 token 也无效，直接拒绝
  if (originalRequest._retry) {
    httpLogger.warn('⚠️ 重试请求仍然返回 401');
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
  }

  // 标记为重试请求，防止无限循环
  originalRequest._retry = true;

  try {
    // 委托 TokenRefreshService 处理刷新
    const newToken = await TokenRefreshService.handleUnauthorized();
    
    if (newToken) {
      // 刷新成功，重试原请求
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return request(originalRequest);
    }
    
    // 刷新失败（TokenRefreshService 已处理跳转）
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
  } catch (err) {
    return Promise.reject({ code: 401, message: '认证失败，请重新登录' });
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
