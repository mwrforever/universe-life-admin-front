/**
 * OAuth2认证服务 - 精简版
 * 仅保留Token刷新和撤销功能
 */

import { authLogger } from '@/utils/logger';
import { TokenManager } from '@/services/auth/tokenManager';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

const OAUTH2_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH2_CLIENT_ID || 'Kp7vR9mNxq2L8tQwYzba',
  ACCESS_TOKEN_EXPIRES_IN: 3600,
};

const OAUTH2_ENDPOINTS = {
  TOKEN: `${import.meta.env.VITE_OAUTH2_ISSUER || 'http://localhost:8099'}/oauth2/token`,
  REVOKE: `${import.meta.env.VITE_OAUTH2_ISSUER || 'http://localhost:8099'}/oauth2/revoke`,
};

export class OAuth2Service {
  /**
   * 刷新访问Token
   * @throws {Error} 当Token刷新失败时抛出异常
   */
  static async refreshAccessToken(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      authLogger.warn('⚠️ 没有可用的刷新Token');
      throw new Error('没有可用的刷新Token');
    }

    authLogger.info('🔄 开始刷新访问Token...');

    try {
      const response = await fetch(OAUTH2_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: OAUTH2_CONFIG.CLIENT_ID,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        authLogger.error(`❌ Token刷新请求失败: ${response.status}`, errorText);
        TokenManager.clearTokens();

        // 根据 HTTP 状态码转换为业务错误
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录');
        } else if (response.status === 400) {
          throw new Error('Token无效或已过期');
        } else {
          throw new Error(`Token刷新失败: ${response.status}`);
        }
      }

      const tokenData = (await response.json()) as TokenResponse;

      if (!tokenData.access_token) {
        authLogger.error('❌ 刷新响应中缺少access_token');
        TokenManager.clearTokens();
        throw new Error('刷新响应中缺少access_token');
      }

      TokenManager.setAccessToken(tokenData.access_token, tokenData.expires_in || OAUTH2_CONFIG.ACCESS_TOKEN_EXPIRES_IN);

      if (tokenData.refresh_token) {
        TokenManager.setRefreshToken(tokenData.refresh_token);
      }

      authLogger.info('✅ Token刷新成功');
    } catch (err) {
      // 重新抛出异常，让调用方处理
      authLogger.error('❌ Token刷新过程中发生异常:', err);
      TokenManager.clearTokens();
      throw err;
    }
  }

  /**
   * 检查Token是否需要刷新
   */
  static shouldRefreshToken(): boolean {
    return TokenManager.isTokenExpired();
  }

  /**
   * 自动刷新Token（如果需要）
   * @returns {boolean} 是否需要刷新以及刷新是否成功
   */
  static async autoRefreshToken(): Promise<boolean> {
    if (this.shouldRefreshToken()) {
      try {
        await this.refreshAccessToken();
        return true;
      } catch (err) {
        return false;
      }
    }
    return true;
  }

  /**
   * 撤销Token
   */
  static async revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token'): Promise<boolean> {
    try {
      const response = await fetch(OAUTH2_ENDPOINTS.REVOKE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token,
          token_type_hint: tokenTypeHint,
          client_id: OAUTH2_CONFIG.CLIENT_ID,
        }),
      });

      if (response.ok || response.status === 200) {
        authLogger.info(`✅ ${tokenTypeHint}撤销成功`);
        return true;
      }

      authLogger.warn(`⚠️ ${tokenTypeHint}撤销失败: ${response.status}`);
      return false;
    } catch (err) {
      authLogger.error(`❌ ${tokenTypeHint}撤销异常:`, err);
      return false;
    }
  }

  /**
   * 检查是否已登录
   */
  static isLoggedIn(): boolean {
    return TokenManager.isLoggedIn();
  }
}

export default OAuth2Service;
