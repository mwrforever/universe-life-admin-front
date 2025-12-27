/**
 * Token管理器
 * 负责OAuth2令牌的存储、获取、刷新和清理
 */

import { authLogger } from '@/utils/logger';

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'universe_access_token',
  REFRESH_TOKEN: 'universe_refresh_token',
  ID_TOKEN: 'universe_id_token',
  USER_INFO: 'universe_user_info',
  TOKEN_EXPIRES_AT: 'universe_token_expires_at',
};

const PKCE_KEYS = {
  CODE_VERIFIER: 'oauth2_code_verifier',
  STATE: 'oauth2_state',
  AUTH_REDIRECT: 'oauth2_redirect_url',
};

export class TokenManager {
  /**
   * 存储访问令牌及过期时间
   */
  static setAccessToken(token: string, expiresIn: number): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString());
    authLogger.info('✅ Access Token已存储，过期时间:', new Date(expiresAt).toLocaleString());
  }

  /**
   * 获取访问令牌（过期返回null）
   */
  static getAccessToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);

    if (!token) {
      return null;
    }

    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      authLogger.warn('⚠️ Access Token已过期');
      return null;
    }

    return token;
  }

  /**
   * 存储刷新令牌
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    authLogger.info('✅ Refresh Token已存储');
  }

  /**
   * 获取刷新令牌
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * 存储ID Token
   */
  static setIDToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.ID_TOKEN, token);
    authLogger.info('✅ ID Token已存储');
  }

  /**
   * 获取ID Token
   */
  static getIDToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ID_TOKEN);
  }

  /**
   * 存储用户信息
   */
  static setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    authLogger.info('✅ 用户信息已存储:', userInfo.username);
  }

  /**
   * 获取用户信息
   */
  static getUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem(TOKEN_KEYS.USER_INFO);
    if (!userInfoStr) {
      return null;
    }
    try {
      return JSON.parse(userInfoStr) as UserInfo;
    } catch {
      authLogger.error('❌ 解析用户信息失败');
      return null;
    }
  }

  /**
   * 清除所有令牌和用户信息
   */
  static clearTokens(): void {
    Object.values(TOKEN_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    Object.values(PKCE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    authLogger.info('🧹 所有Token和认证数据已清除');
  }

  /**
   * 检查令牌是否即将过期（5分钟内）
   */
  static isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
    if (!expiresAt) {
      return true;
    }
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() + fiveMinutes > parseInt(expiresAt, 10);
  }

  /**
   * 检查是否已登录
   */
  static isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * 存储PKCE code_verifier
   */
  static setCodeVerifier(verifier: string): void {
    localStorage.setItem(PKCE_KEYS.CODE_VERIFIER, verifier);
  }

  /**
   * 获取并清除PKCE code_verifier
   */
  static getAndClearCodeVerifier(): string | null {
    const verifier = localStorage.getItem(PKCE_KEYS.CODE_VERIFIER);
    localStorage.removeItem(PKCE_KEYS.CODE_VERIFIER);
    return verifier;
  }

  /**
   * 存储OAuth2 state
   */
  static setState(state: string): void {
    localStorage.setItem(PKCE_KEYS.STATE, state);
  }

  /**
   * 获取并清除OAuth2 state
   */
  static getAndClearState(): string | null {
    const state = localStorage.getItem(PKCE_KEYS.STATE);
    localStorage.removeItem(PKCE_KEYS.STATE);
    return state;
  }

  /**
   * 存储认证后重定向URL
   */
  static setAuthRedirect(url: string): void {
    localStorage.setItem(PKCE_KEYS.AUTH_REDIRECT, url);
  }

  /**
   * 获取并清除认证后重定向URL
   */
  static getAndClearAuthRedirect(): string | null {
    const url = localStorage.getItem(PKCE_KEYS.AUTH_REDIRECT);
    localStorage.removeItem(PKCE_KEYS.AUTH_REDIRECT);
    return url;
  }
}

export default TokenManager;
