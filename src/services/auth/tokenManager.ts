/**
 * Token管理器
 * 负责令牌的存储、获取、刷新和清理
 * 基于后端接口文档 v1.0.0
 */

import { authLogger } from '@/utils/logger';

// ID Token Payload 中的用户信息
export interface IdTokenPayload {
  sub: string;           // 用户标识
  iss: string;           // 签发者
  user_name: string;     // 用户名
  user_avatar: string;   // 用户头像
  auth_time: number;     // 认证时间
  exp: number;           // 过期时间
  iat: number;           // 签发时间
}

// 用户信息（从 id_token 解析）
export interface UserInfo {
  sub: string;
  userName: string;
  userAvatar: string;
  authTime: number;
}

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'universe_access_token',
  REFRESH_TOKEN: 'universe_refresh_token',
  ID_TOKEN: 'universe_id_token',
  USER_INFO: 'universe_user_info',
  TOKEN_EXPIRES_AT: 'universe_token_expires_at',
  REFRESH_EXPIRES_AT: 'universe_refresh_expires_at',
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
   * 存储 ID Token
   */
  static setIdToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.ID_TOKEN, token);
    authLogger.info('✅ ID Token已存储');
  }

  /**
   * 获取 ID Token
   */
  static getIdToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ID_TOKEN);
  }

  /**
   * 解析 JWT Token 获取 Payload
   */
  static parseJwtPayload<T>(token: string): T | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${  (`00${  c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload) as T;
    } catch {
      authLogger.error('❌ 解析JWT Token失败');
      return null;
    }
  }

  /**
   * 从 ID Token 解析用户信息
   */
  static parseUserInfoFromIdToken(idToken: string): UserInfo | null {
    const payload = this.parseJwtPayload<IdTokenPayload>(idToken);
    if (!payload) {
      return null;
    }
    return {
      sub: payload.sub,
      userName: payload.user_name,
      userAvatar: payload.user_avatar,
      authTime: payload.auth_time,
    };
  }

  /**
   * 存储用户信息
   */
  static setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    authLogger.info('✅ 用户信息已存储:', userInfo.userName);
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
   * 存储登录信息（从API响应的TokenData中保存）
   */
  static saveLoginData(tokenData: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    refresh_expires_in: number;
  }): void {
    this.setAccessToken(tokenData.access_token, tokenData.expires_in);
    this.setRefreshToken(tokenData.refresh_token);
    this.setIdToken(tokenData.id_token);
    
    // 从 id_token 解析用户信息
    const userInfo = this.parseUserInfoFromIdToken(tokenData.id_token);
    if (userInfo) {
      this.setUserInfo(userInfo);
    }
    
    // 存储 refresh_token 过期时间
    const refreshExpiresAt = Date.now() + tokenData.refresh_expires_in * 1000;
    localStorage.setItem(TOKEN_KEYS.REFRESH_EXPIRES_AT, refreshExpiresAt.toString());
    
    authLogger.info('✅ 登录数据已完整存储');
  }
}

export default TokenManager;
