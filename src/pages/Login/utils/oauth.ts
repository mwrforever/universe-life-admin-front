/**
 * OAuth第三方登录处理工具函数
 */

import { OAuthProvider, OAuthConfig, LoginResponse } from '../types/Login.types';
import { OAUTH_CONFIGS, API_ENDPOINTS } from './constants';

// OAuth状态管理
interface OAuthState {
  provider: OAuthProvider;
  state: string;
  codeVerifier?: string;
  timestamp: number;
}

// 生成随机字符串
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 生成OAuth状态参数
export const generateOAuthState = (provider: OAuthProvider): string => {
  const timestamp = Date.now();
  const random = generateRandomString(16);
  return `${provider}_${timestamp}_${random}`;
};

// 验证OAuth状态
export const validateOAuthState = (state: string, expectedProvider: OAuthProvider): boolean => {
  try {
    const [provider, timestamp] = state.split('_');
    return provider === expectedProvider && Date.now() - parseInt(timestamp) < 300000; // 5分钟有效期
  } catch {
    return false;
  }
};

// 生成PKCE参数（用于OAuth 2.0 PKCE）
export const generatePKCE = (): { codeVerifier: string; codeChallenge: string } => {
  const codeVerifier = generateRandomString(128);
  // 这里简化处理，实际应用中需要使用SHA256并base64url编码
  const codeChallenge = btoa(codeVerifier).replace(/[+/=]/g, '');
  return { codeVerifier, codeChallenge };
};

// 构建OAuth授权URL
export const buildOAuthUrl = (provider: OAuthProvider, config: OAuthConfig): string => {
  const state = generateOAuthState(provider);
  const { codeVerifier, codeChallenge } = generatePKCE();

  // 存储OAuth状态到sessionStorage
  const oauthState: OAuthState = {
    provider,
    state,
    codeVerifier,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(`oauth_state_${provider}`, JSON.stringify(oauthState));

  // 构建授权URL（这里简化处理，实际需要根据不同OAuth提供商的规范）
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: 'your_client_id', // 实际应用中从配置获取
    redirect_uri: encodeURIComponent(`${window.location.origin}/oauth/callback`),
    scope: getOAuthScope(provider),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${config.authUrl}?${params.toString()}`;
};

// 获取OAuth权限范围
export const getOAuthScope = (provider: OAuthProvider): string => {
  const scopes = {
    [OAuthProvider.WECHAT]: 'snsapi_login',
    [OAuthProvider.QQ]: 'get_user_info',
    [OAuthProvider.ALIPAY]: 'auth_user',
    [OAuthProvider.WEIBO]: 'email',
  };
  return scopes[provider] || 'basic';
};

// 处理OAuth回调
export const handleOAuthCallback = async (
  provider: OAuthProvider,
  code: string,
  state: string
): Promise<LoginResponse> => {
  try {
    // 验证状态参数
    const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
    if (!storedState) {
      throw new Error('OAuth state not found');
    }

    const oauthState: OAuthState = JSON.parse(storedState);
    if (!validateOAuthState(state, provider)) {
      throw new Error('Invalid OAuth state');
    }

    // 清除存储的状态
    sessionStorage.removeItem(`oauth_state_${provider}`);

    // 发送授权码到后端
    const response = await fetch(API_ENDPOINTS.LOGIN_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        codeVerifier: oauthState.codeVerifier,
        redirectUri: `${window.location.origin}/oauth/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'OAuth登录失败');
    }

    return data as LoginResponse;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'OAuth登录失败',
    };
  }
};

// 检查OAuth弹窗是否被阻止
export const checkOAuthPopupBlocked = (popup: Window | null): boolean => {
  if (!popup || popup.closed) {
    return true;
  }

  try {
    // 尝试访问弹窗的location，如果被阻止会抛出异常
    popup.location.href;
    return false;
  } catch {
    return true;
  }
};

// 打开OAuth弹窗
export const openOAuthPopup = (
  provider: OAuthProvider,
  config: OAuthConfig
): Window | null => {
  const url = buildOAuthUrl(provider, config);
  const width = 600;
  const height = 700;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  const popup = window.open(
    url,
    `oauth_${provider}`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );

  return popup;
};

// 监听OAuth弹窗消息
export const listenOAuthPopup = (
  popup: Window,
  provider: OAuthProvider,
  onSuccess: (response: LoginResponse) => void,
  onError: (error: string) => void,
  timeout: number = 300000 // 5分钟超时
): (() => void) => {
  const timeoutId = setTimeout(() => {
    onError('OAuth登录超时');
    popup.close();
  }, timeout);

  const messageHandler = (event: MessageEvent) => {
    // 验证消息来源
    if (event.origin !== window.location.origin) {
      return;
    }

    const { type, provider: messageProvider, code, state, error } = event.data;

    if (type === 'OAUTH_CALLBACK' && messageProvider === provider) {
      clearTimeout(timeoutId);
      window.removeEventListener('message', messageHandler);

      if (error) {
        onError(error);
      } else if (code && state) {
        handleOAuthCallback(provider, code, state)
          .then(onSuccess)
          .catch(onError);
      } else {
        onError('OAuth回调参数不完整');
      }

      popup.close();
    }
  };

  window.addEventListener('message', messageHandler);

  // 返回清理函数
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('message', messageHandler);
  };
};

// 获取OAuth用户信息
export const getOAuthUserInfo = async (
  provider: OAuthProvider,
  accessToken: string
): Promise<any> => {
  try {
    const endpoints = {
      [OAuthProvider.WECHAT]: '/api/oauth/wechat/userinfo',
      [OAuthProvider.QQ]: '/api/oauth/qq/userinfo',
      [OAuthProvider.ALIPAY]: '/api/oauth/alipay/userinfo',
      [OAuthProvider.WEIBO]: '/api/oauth/weibo/userinfo',
    };

    const response = await fetch(endpoints[provider], {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Get OAuth user info error:', error);
    throw error;
  }
};

// OAuth配置验证
export const validateOAuthConfig = (config: OAuthConfig): boolean => {
  return !!(
    config.provider &&
    config.name &&
    config.icon &&
    config.color &&
    config.authUrl
  );
};

// 获取OAuth按钮样式
export const getOAuthButtonStyle = (config: OAuthConfig) => ({
  backgroundColor: config.color,
  borderColor: config.color,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: config.hoverColor,
    borderColor: config.hoverColor,
    filter: 'brightness(1.1)',
  },
});

// OAuth错误处理
export const handleOAuthError = (error: any): string => {
  if (error.name === 'PopupBlockedError') {
    return '登录弹窗被浏览器阻止，请允许弹窗后重试';
  }

  if (error.name === 'TimeoutError') {
    return '登录超时，请重试';
  }

  if (error.message?.includes('access_denied')) {
    return '用户取消了授权';
  }

  if (error.message?.includes('invalid_client')) {
    return '应用配置错误，请联系管理员';
  }

  return error.message || 'OAuth登录失败，请重试';
};

// OAuth类型守卫
export const isValidOAuthProvider = (provider: string): provider is OAuthProvider => {
  return Object.values(OAuthProvider).includes(provider as OAuthProvider);
};

// 清理OAuth相关存储
export const clearOAuthStorage = (provider?: OAuthProvider) => {
  if (provider) {
    sessionStorage.removeItem(`oauth_state_${provider}`);
  } else {
    // 清除所有OAuth状态
    Object.values(OAuthProvider).forEach(p => {
      sessionStorage.removeItem(`oauth_state_${p}`);
    });
  }
};