/**
 * Token 刷新服务
 * 采用懒加载模式，使用原生 fetch 进行刷新请求
 * 避免与 axios 拦截器冲突
 */

import { TokenManager } from './tokenManager';
import { authLogger } from '@/utils/logger';

// OAuth2 标准响应格式
export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

// 刷新结果
export interface RefreshResult {
  success: boolean;
  token?: string;
  error?: string;
}

// 等待刷新的请求
interface PendingRequest {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}

// OAuth2 配置
const OAUTH2_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH2_CLIENT_ID || 'Kp7vR9mNxq2L8tQwYzba',
  TOKEN_ENDPOINT: '/oauth2/token',
};

export class TokenRefreshService {
  // 统一的并发控制（getValidToken 和 handleUnauthorized 共享）
  private static isRefreshing = false;
  private static refreshPromise: Promise<RefreshResult> | null = null;
  private static pendingRequests: PendingRequest[] = [];

  /**
   * 跳转到登录页（防止重复跳转）
   */
  private static redirectToLogin(): void {
    authLogger.info('🔄 跳转到登录页...');
    TokenManager.clearTokens();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * 使用原生 fetch 刷新 token
   * 请求 /oauth2/token（通过 Vite 代理到 http://localhost:8099）
   */
  private static async doRefresh(): Promise<RefreshResult> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      authLogger.warn('⚠️ 没有可用的 refresh_token');
      return { success: false, error: '没有可用的刷新令牌' };
    }

    authLogger.info('🔄 开始刷新 Token...');

    try {
      const requestBody = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OAUTH2_CONFIG.CLIENT_ID,
      });

      const response = await fetch(OAUTH2_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: requestBody,
      });

      // 非 200 状态码，刷新失败
      if (response.status !== 200) {
        authLogger.error(`❌ Token 刷新失败，状态码: ${response.status}`);
        return { success: false, error: `刷新失败: ${response.status}` };
      }

      // 解析响应
      const responseText = await response.text();
      authLogger.info('📥 Token 刷新响应:', responseText);
      
      let tokenData: OAuth2TokenResponse;
      
      try {
        tokenData = JSON.parse(responseText) as OAuth2TokenResponse;
      } catch {
        authLogger.error('❌ 解析 Token 响应失败');
        return { success: false, error: '响应格式错误' };
      }

      // 验证必要字段
      if (!tokenData.access_token) {
        authLogger.error('❌ 响应中缺少 access_token');
        return { success: false, error: '响应中缺少 access_token' };
      }

      // 存储新的 token
      const expiresIn = tokenData.expires_in || 3600;
      TokenManager.setAccessToken(tokenData.access_token, expiresIn);

      // 如果有新的 refresh_token，也更新
      if (tokenData.refresh_token) {
        TokenManager.setRefreshToken(tokenData.refresh_token);
      }

      authLogger.info('✅ Token 刷新成功并已存储');
      return { success: true, token: tokenData.access_token };

    } catch (error) {
      authLogger.error('❌ Token 刷新异常:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '刷新异常' 
      };
    }
  }

  /**
   * 执行刷新（统一入口，确保只有一个刷新请求）
   */
  private static async executeRefresh(): Promise<RefreshResult> {
    // 如果已经在刷新中，等待现有的刷新完成
    if (this.isRefreshing && this.refreshPromise) {
      authLogger.info('⏳ 已有刷新请求进行中，等待完成...');
      return this.refreshPromise;
    }

    // 开始新的刷新
    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      const result = await this.refreshPromise;
      
      // 通知所有等待的请求
      if (result.success && result.token) {
        this.pendingRequests.forEach(req => req.resolve(result.token!));
      } else {
        // 刷新失败，通知所有等待的请求
        this.pendingRequests.forEach(req => req.resolve(null));
      }
      this.pendingRequests = [];
      
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * 获取有效的 access_token（懒加载模式）
   * - 如果 token 有效，直接返回
   * - 如果 token 过期且有 refresh_token，自动刷新
   * - 如果无法获取有效 token，返回 null
   */
  static async getValidToken(): Promise<string | null> {
    // 1. 检查当前 token 是否有效
    const currentToken = TokenManager.getAccessToken();
    if (currentToken) {
      return currentToken;
    }

    // 2. token 过期，检查是否有 refresh_token
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      authLogger.warn('⚠️ 无有效 token 且无 refresh_token');
      return null;
    }

    // 3. 尝试刷新 token（使用统一的刷新入口）
    authLogger.info('🔄 Access Token 已过期，尝试刷新...');
    
    const result = await this.executeRefresh();
    return result.success ? result.token || null : null;
  }

  /**
   * 处理 401 未授权响应
   * - 如果有 refresh_token，尝试刷新
   * - 刷新成功返回新 token，失败跳转登录
   * - 支持并发控制，多个 401 只发起一次刷新
   */
  static async handleUnauthorized(): Promise<string | null> {
    const refreshToken = TokenManager.getRefreshToken();

    // 1. 没有 refresh_token，直接跳转登录
    if (!refreshToken) {
      authLogger.warn('⚠️ 收到 401 且无 refresh_token，跳转登录');
      this.redirectToLogin();
      return null;
    }

    // 2. 如果已经在刷新中，加入等待队列
    if (this.isRefreshing) {
      authLogger.info('⏳ 等待正在进行的 Token 刷新...');
      return new Promise<string | null>((resolve, reject) => {
        this.pendingRequests.push({
          resolve,
          reject,
        });
      });
    }

    // 3. 开始刷新流程（使用统一的刷新入口）
    authLogger.info('🔄 收到 401，开始刷新 Token...');
    
    const result = await this.executeRefresh();

    if (result.success && result.token) {
      return result.token;
    }

    // 刷新失败，跳转登录
    this.redirectToLogin();
    return null;
  }

  /**
   * 检查是否已登录（有有效 token）
   */
  static isLoggedIn(): boolean {
    return TokenManager.isLoggedIn();
  }
}

export default TokenRefreshService;
