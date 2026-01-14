/**
 * OAuth2认证服务 - 精简版
 * 仅保留 Token 撤销功能
 * Token 刷新逻辑已移至 TokenRefreshService
 */

import { authLogger } from '@/utils/logger';
import { TokenManager } from '@/services/auth/tokenManager';

const OAUTH2_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH2_CLIENT_ID || 'Kp7vR9mNxq2L8tQwYzba',
};

const OAUTH2_ENDPOINTS = {
  REVOKE: '/oauth2/revoke',
};

export class OAuth2Service {
  /**
   * 撤销 Token
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
        authLogger.info(`✅ ${tokenTypeHint} 撤销成功`);
        return true;
      }

      authLogger.warn(`⚠️ ${tokenTypeHint} 撤销失败: ${response.status}`);
      return false;
    } catch (err) {
      authLogger.error(`❌ ${tokenTypeHint} 撤销异常:`, err);
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
