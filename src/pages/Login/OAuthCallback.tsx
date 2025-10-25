/**
 * OAuth回调处理页面
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { OAuthProvider } from './types/Login.types';
import { handleOAuthCallback, clearOAuthStorage } from './utils/oauth';
import { useAuth } from './hooks/useAuth';
import { LoginContainer } from './styles/Login.styles';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('处理OAuth登录中...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const provider = searchParams.get('provider') as OAuthProvider;

        if (!code || !state || !provider) {
          throw new Error('OAuth回调参数不完整');
        }

        setMessage('正在验证授权信息...');
        const response = await handleOAuthCallback(provider, code, state);

        if (response.success) {
          setStatus('success');
          setMessage('登录成功，正在跳转...');

          // 等待一秒后跳转到主页
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setStatus('error');
          setMessage(response.message || 'OAuth登录失败');

          // 清理OAuth状态
          clearOAuthStorage(provider);

          // 3秒后跳转回登录页
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'OAuth处理失败');

        // 清理所有OAuth状态
        clearOAuthStorage();

        // 3秒后跳转回登录页
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return '#1890ff';
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
      default:
        return '#666666';
    }
  };

  return (
    <LoginContainer>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'var(--login-card-bg)',
        borderRadius: 'var(--login-radius-large)',
        boxShadow: 'var(--login-shadow-card)',
        maxWidth: '400px',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          animation: 'pulse 2s infinite',
        }}>
          {getStatusIcon()}
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--login-text-primary)',
          marginBottom: '8px',
          margin: '0 0 8px 0',
        }}>
          OAuth登录处理
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'var(--login-text-secondary)',
          margin: '0 0 24px 0',
          lineHeight: '1.5',
        }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 24px',
              backgroundColor: 'var(--login-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--login-radius-medium)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all var(--login-transition-fast)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--login-primary-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--login-primary)';
            }}
          >
            返回登录页
          </button>
        )}

        {status === 'loading' && (
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--login-border)',
            borderRadius: 'var(--login-radius-small)',
            overflow: 'hidden',
            marginTop: '16px',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: getStatusColor(),
              animation: 'loading 1.5s ease-in-out infinite',
            }} />
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }

          @keyframes loading {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </LoginContainer>
  );
};

OAuthCallback.displayName = 'OAuthCallback';

export default OAuthCallback;