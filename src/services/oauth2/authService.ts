/**
 * OAuth2认证服务
 * 基于Spring Security Authorization Server 1.2.7的PKCE授权码流程
 */

import CryptoJS from 'crypto-js';
import { authLogger } from '@/utils/logger';
import { TokenManager } from './tokenManager';
import type { UserInfo } from './tokenManager';

interface PKCEChallenge {
  code_verifier: string;
  code_challenge: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface IDTokenPayload {
  sub: string;
  username?: string;
  preferred_username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  picture?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string | string[];
}

interface AuthCallbackResult {
  success: boolean;
  error?: string;
}

interface LogoutResult {
  success: boolean;
  message: string;
}

export interface OpenIDConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  end_session_endpoint?: string;
  revocation_endpoint?: string;
}

const OAUTH2_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH2_CLIENT_ID || 'aB3dE9fG1hI4jK5lM7nO0pQ2',
  REDIRECT_URI: import.meta.env.VITE_OAUTH2_REDIRECT_URI || 'http://localhost:5000/auth/callback',
  POST_LOGOUT_REDIRECT_URI:
    import.meta.env.VITE_OAUTH2_POST_LOGOUT_REDIRECT_URI || 'http://localhost:8099/auth/login/employee',
  SCOPE: import.meta.env.VITE_OAUTH2_SCOPE || 'openid profile',
  ISSUER: import.meta.env.VITE_OAUTH2_ISSUER || 'http://localhost:8099',
  ACCESS_TOKEN_EXPIRES_IN: 3600,
};

const OAUTH2_ENDPOINTS = {
  AUTHORIZATION: `${OAUTH2_CONFIG.ISSUER}/oauth2/authorize`,
  TOKEN: `${OAUTH2_CONFIG.ISSUER}/oauth2/token`,
  REVOKE: `${OAUTH2_CONFIG.ISSUER}/oauth2/revoke`,
  USER_INFO: `${OAUTH2_CONFIG.ISSUER}/userinfo`,
  CONNECT_LOGOUT: `${OAUTH2_CONFIG.ISSUER}/connect/logout`,
  OAUTH2_LOGOUT: `${OAUTH2_CONFIG.ISSUER}/oauth2/logout`,
  OPENID_CONFIGURATION: `${OAUTH2_CONFIG.ISSUER}/.well-known/openid-configuration`,
  JWKS_URI: `${OAUTH2_CONFIG.ISSUER}/oauth2/jwks`,
};

export class OAuth2Service {
  /**
   * 生成PKCE挑战
   * 生产环境(HTTPS)使用 crypto.subtle，开发环境(HTTP)使用 crypto-js 回退
   */
  static async generatePKCEChallenge(): Promise<PKCEChallenge> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const code_verifier = this.base64UrlEncode(array);

    let code_challenge: string;

    // 生产环境(HTTPS/localhost)优先使用 crypto.subtle
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(code_verifier);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      code_challenge = this.base64UrlEncode(new Uint8Array(hashBuffer));
      authLogger.debug('🔐 PKCE挑战生成完成 (crypto.subtle)');
    } else {
      // 开发环境(HTTP)使用 crypto-js 回退
      const hash = CryptoJS.SHA256(code_verifier);
      code_challenge = hash.toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      authLogger.debug('🔐 PKCE挑战生成完成 (crypto-js fallback)');
    }

    return { code_verifier, code_challenge };
  }

  /**
   * Base64 URL编码
   */
  private static base64UrlEncode(buffer: Uint8Array): string {
    let binary = '';
    buffer.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * 生成随机state参数
   */
  static generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  /**
   * 构建授权URL
   */
  static async buildAuthorizationUrl(): Promise<string> {
    const { code_verifier, code_challenge } = await this.generatePKCEChallenge();
    const state = this.generateState();

    TokenManager.setCodeVerifier(code_verifier);
    TokenManager.setState(state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: OAUTH2_CONFIG.CLIENT_ID,
      redirect_uri: OAUTH2_CONFIG.REDIRECT_URI,
      scope: OAUTH2_CONFIG.SCOPE,
      state,
      code_challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${OAUTH2_ENDPOINTS.AUTHORIZATION}?${params.toString()}`;
    authLogger.info('🔗 授权URL已构建');
    return authUrl;
  }

  /**
   * 发起授权流程
   * 重定向到授权服务器
   */
  static async initiateAuthorization(redirectUrl?: string): Promise<void> {
    if (redirectUrl) {
      TokenManager.setAuthRedirect(redirectUrl);
    } else {
      TokenManager.setAuthRedirect(window.location.pathname + window.location.search);
    }

    authLogger.info('🚀 发起OAuth2授权流程...');
    const authUrl = await this.buildAuthorizationUrl();
    window.location.href = authUrl;
  }

  /**
   * 交换授权码获取Token
   */
  static async exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    authLogger.info('🔄 开始交换授权码...');

    const response = await fetch(OAUTH2_ENDPOINTS.TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: OAUTH2_CONFIG.REDIRECT_URI,
        client_id: OAUTH2_CONFIG.CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      authLogger.error(`❌ Token交换失败: ${response.status}`, errorText);
      throw new Error(`Token交换失败: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    authLogger.info('✅ Token交换成功');
    return tokenData;
  }

  /**
   * 处理授权回调
   */
  static async handleAuthorizationCallback(code: string, state: string): Promise<AuthCallbackResult> {
    try {
      const savedState = TokenManager.getAndClearState();
      if (savedState !== state) {
        authLogger.error('❌ State验证失败');
        return { success: false, error: 'State验证失败，可能存在CSRF攻击' };
      }

      const codeVerifier = TokenManager.getAndClearCodeVerifier();
      if (!codeVerifier) {
        authLogger.error('❌ 缺少code_verifier');
        return { success: false, error: '缺少PKCE验证参数' };
      }

      const tokenData = await this.exchangeCodeForToken(code, codeVerifier);

      TokenManager.setAccessToken(tokenData.access_token, tokenData.expires_in || OAUTH2_CONFIG.ACCESS_TOKEN_EXPIRES_IN);

      if (tokenData.refresh_token) {
        TokenManager.setRefreshToken(tokenData.refresh_token);
      }

      if (tokenData.id_token) {
        TokenManager.setIDToken(tokenData.id_token);
        const user = this.parseIDToken(tokenData.id_token);
        if (user) {
          TokenManager.setUserInfo(user);
        }
      }

      authLogger.info('✅ 授权回调处理成功');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      authLogger.error('❌ 授权回调处理失败:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * 解析ID Token获取用户信息
   */
  static parseIDToken(idToken: string): UserInfo | null {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('无效的ID Token格式');
      }

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as IDTokenPayload;

      authLogger.info('📋 ID Token解析成功:', {
        sub: payload.sub,
        username: payload.username || payload.preferred_username,
      });

      return {
        id: parseInt(payload.sub, 10) || 0,
        username: payload.username || payload.preferred_username || payload.name || '',
        nickname: payload.name || payload.username || payload.preferred_username || '',
        avatar: payload.avatar || payload.picture || '/default-avatar.png',
        phone: '',
        email: payload.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      authLogger.error('❌ ID Token解析失败:', err);
      return null;
    }
  }

  /**
   * 获取当前用户信息
   */
  static getCurrentUser(): UserInfo | null {
    return TokenManager.getUserInfo();
  }

  /**
   * 检查是否已登录
   */
  static isLoggedIn(): boolean {
    return TokenManager.isLoggedIn();
  }

  /**
   * 获取认证后重定向URL
   */
  static getRedirectUrl(): string | null {
    return TokenManager.getAndClearAuthRedirect();
  }

  /**
   * 刷新访问Token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        authLogger.warn('⚠️ 没有可用的刷新Token');
        return false;
      }

      authLogger.info('🔄 开始刷新访问Token...');

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
        return false;
      }

      const tokenData = await response.json();

      if (!tokenData.access_token) {
        authLogger.error('❌ 刷新响应中缺少access_token');
        TokenManager.clearTokens();
        return false;
      }

      TokenManager.setAccessToken(tokenData.access_token, tokenData.expires_in || OAUTH2_CONFIG.ACCESS_TOKEN_EXPIRES_IN);

      if (tokenData.refresh_token) {
        TokenManager.setRefreshToken(tokenData.refresh_token);
      }

      if (tokenData.id_token) {
        TokenManager.setIDToken(tokenData.id_token);
        const user = this.parseIDToken(tokenData.id_token);
        if (user) {
          TokenManager.setUserInfo(user);
        }
      }

      authLogger.info('✅ Token刷新成功');
      return true;
    } catch (err) {
      authLogger.error('❌ Token刷新过程中发生异常:', err);
      TokenManager.clearTokens();
      return false;
    }
  }

  /**
   * 检查Token是否需要刷新
   */
  static shouldRefreshToken(): boolean {
    return TokenManager.isTokenExpiringSoon();
  }

  /**
   * 自动刷新Token（如果需要）
   */
  static async autoRefreshToken(): Promise<boolean> {
    if (this.shouldRefreshToken()) {
      return await this.refreshAccessToken();
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
   * 登出
   */
  static async logout(): Promise<LogoutResult> {
    try {
      authLogger.info('🚪 开始登出流程...');

      const accessToken = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();
      const idToken = TokenManager.getIDToken();

      if (accessToken) {
        await this.revokeToken(accessToken, 'access_token');
      }

      if (refreshToken) {
        await this.revokeToken(refreshToken, 'refresh_token');
      }

      TokenManager.clearTokens();

      if (idToken) {
        const logoutUrl = new URL(OAUTH2_ENDPOINTS.CONNECT_LOGOUT);
        logoutUrl.searchParams.set('id_token_hint', idToken);
        logoutUrl.searchParams.set('post_logout_redirect_uri', OAUTH2_CONFIG.POST_LOGOUT_REDIRECT_URI);
        logoutUrl.searchParams.set('client_id', OAUTH2_CONFIG.CLIENT_ID);

        authLogger.info('🔗 准备跳转到登出URL');
        window.location.href = logoutUrl.toString();
        return { success: true, message: '正在跳转到授权服务器登出...' };
      }

      return { success: true, message: '登出成功' };
    } catch (err) {
      authLogger.error('❌ 登出过程中发生异常:', err);
      TokenManager.clearTokens();
      return { success: false, message: '登出过程中发生错误，但本地数据已清理' };
    }
  }

  /**
   * 获取OpenID Connect配置信息
   */
  static async getOpenIDConfiguration(): Promise<OpenIDConfiguration | null> {
    try {
      authLogger.info('🔍 获取OpenID Connect配置...');

      const response = await fetch(OAUTH2_ENDPOINTS.OPENID_CONFIGURATION, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`获取配置失败: ${response.status} ${response.statusText}`);
      }

      const config = await response.json();
      authLogger.info('✅ OpenID Connect配置获取成功');
      return config;
    } catch (err) {
      authLogger.warn('⚠️ 获取OpenID Connect配置失败:', err);
      return null;
    }
  }
}

export default OAuth2Service;
