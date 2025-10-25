/**
 * 第三方登录组件
 */

import React, { useState } from 'react';
import { ThirdPartyLoginProps } from '../types/Login.types';
import { ThirdPartyContainer } from '../styles/Login.styles';
import { OAUTH_CONFIGS } from '../utils/constants';
import { openOAuthPopup, checkOAuthPopupBlocked, listenOAuthPopup } from '../utils/oauth';
import { useTheme } from '@/contexts/ThemeContext';

const ThirdPartyLogin: React.FC<ThirdPartyLoginProps> = ({
  onOAuthLogin,
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthClick = async (provider: string) => {
    if (loadingProvider) return;

    const config = OAUTH_CONFIGS[provider as keyof typeof OAUTH_CONFIGS];
    if (!config) {
      console.error(`Unknown OAuth provider: ${provider}`);
      return;
    }

    try {
      setLoadingProvider(provider);

      // 打开OAuth弹窗
      const popup = openOAuthPopup(provider as any, config);

      // 检查弹窗是否被阻止
      if (checkOAuthPopupBlocked(popup)) {
        throw new Error('登录弹窗被浏览器阻止，请允许弹窗后重试');
      }

      // 监听OAuth回调
      const cleanup = listenOAuthPopup(
        popup!,
        provider as any,
        (response) => {
          setLoadingProvider(null);
          if (response.success) {
            onOAuthLogin(provider as any);
          } else {
            console.error('OAuth login failed:', response.message);
          }
        },
        (error) => {
          setLoadingProvider(null);
          console.error('OAuth error:', error);
        }
      );

      // 设置清理函数
      return cleanup;

    } catch (error) {
      setLoadingProvider(null);
      console.error('OAuth login error:', error);
    }
  };

  // 获取OAuth按钮图标
  const getOAuthIcon = (provider: string) => {
    const iconMap: Record<string, string> = {
      wechat: '💬',
      qq: '🐧',
      alipay: '💰',
      weibo: '📱',
    };
    return iconMap[provider] || '🔗';
  };

  return (
    <ThirdPartyContainer className={className} isDark={isDark}>
      <div className="divider">
        <span>其他登录方式</span>
      </div>
      <div className="oauth-buttons">
        {Object.values(OAUTH_CONFIGS).map((config) => (
          <button
            key={config.provider}
            className="oauth-button"
            style={{
              backgroundColor: isDark ? 'transparent' : '#fff',
              borderColor: config.color,
              color: config.color,
            }}
            onClick={() => handleOAuthClick(config.provider)}
            disabled={loadingProvider === config.provider}
          >
            <span className="icon">
              {loadingProvider === config.provider ? (
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
              ) : (
                getOAuthIcon(config.provider)
              )}
            </span>
            <span>{config.name}</span>
          </button>
        ))}
      </div>
    </ThirdPartyContainer>
  );
};

ThirdPartyLogin.displayName = 'ThirdPartyLogin';

export default ThirdPartyLogin;