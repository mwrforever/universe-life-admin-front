/**
 * 万象生活认证布局组件
 * 毛玻璃效果的登录/注册页面布局
 */

import React from 'react'
import { Outlet } from 'react-router-dom'
import { ConfigProvider, App } from 'antd'
import { antdThemeConfig } from '@/styles'
import '@/styles'

const AuthLayout: React.FC = () => {
  return (
    <ConfigProvider theme={antdThemeConfig}>
      <App>
        <div className="wan-auth-layout">
          {/* 背景装饰 */}
          <div className="wan-auth-background">
            <div className="wan-auth-gradient"></div>
            <div className="wan-auth-pattern"></div>
            <div className="wan-auth-shapes">
              <div className="wan-shape wan-shape-1"></div>
              <div className="wan-shape wan-shape-2"></div>
              <div className="wan-shape wan-shape-3"></div>
              <div className="wan-shape wan-shape-4"></div>
            </div>
          </div>

          {/* 内容容器 */}
          <div className="wan-auth-container">
            {/* 左侧品牌展示区域 */}
            <div className="wan-auth-brand">
              <div className="wan-brand-content">
                <div className="wan-brand-logo">
                  <div className="wan-logo-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                      <circle cx="30" cy="30" r="28" stroke="url(#brand-gradient)" strokeWidth="4"/>
                      <path d="M30 20v10l8 6" stroke="url(#brand-gradient)" strokeWidth="3" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#667eea"/>
                          <stop offset="100%" stopColor="#764ba2"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <h1 className="wan-brand-title">万象生活</h1>
                  <p className="wan-brand-subtitle">让生活更美好</p>
                </div>

                <div className="wan-brand-features">
                  <div className="wan-feature-item">
                    <div className="wan-feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span>优质服务</span>
                  </div>
                  <div className="wan-feature-item">
                    <div className="wan-feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                    <span>便捷管理</span>
                  </div>
                  <div className="wan-feature-item">
                    <div className="wan-feature-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                    </div>
                    <span>安全可靠</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧表单区域 */}
            <div className="wan-auth-form-container">
              <div className="wan-glass-card wan-auth-card">
                <Outlet />
              </div>

              {/* 底部装饰 */}
              <div className="wan-auth-footer">
                <p>&copy; 2024 万象生活. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 全局样式 */}
        <style>{`
          .wan-auth-layout {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
          }

          .wan-auth-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }

          .wan-auth-gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .wan-auth-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image:
              radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            animation: float 6s ease-in-out infinite;
          }

          .wan-auth-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .wan-shape {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(5px);
          }

          .wan-shape-1 {
            width: 200px;
            height: 200px;
            top: 10%;
            left: 10%;
            animation: float 8s ease-in-out infinite;
          }

          .wan-shape-2 {
            width: 150px;
            height: 150px;
            top: 60%;
            left: 80%;
            animation: float 10s ease-in-out infinite reverse;
          }

          .wan-shape-3 {
            width: 100px;
            height: 100px;
            top: 30%;
            left: 70%;
            animation: float 7s ease-in-out infinite;
          }

          .wan-shape-4 {
            width: 120px;
            height: 120px;
            top: 70%;
            left: 20%;
            animation: float 9s ease-in-out infinite reverse;
          }

          .wan-auth-container {
            position: relative;
            z-index: 2;
            min-height: 100vh;
            display: flex;
            align-items: stretch;
          }

          .wan-auth-brand {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
            max-width: 50%;
          }

          .wan-brand-content {
            text-align: center;
            color: white;
          }

          .wan-brand-logo {
            margin-bottom: 40px;
          }

          .wan-logo-icon {
            display: inline-block;
            margin-bottom: 20px;
          }

          .wan-brand-title {
            font-size: 48px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .wan-brand-subtitle {
            font-size: 18px;
            margin: 0;
            opacity: 0.9;
            font-weight: 300;
          }

          .wan-brand-features {
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-top: 60px;
          }

          .wan-feature-item {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 16px;
            opacity: 0.9;
          }

          .wan-feature-icon {
            width: 48px;
            height: 48px;
            border-radius: var(--wan-radius-large);
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .wan-auth-form-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            max-width: 50%;
            position: relative;
          }

          .wan-auth-card {
            width: 100%;
            max-width: 420px;
            padding: 48px;
            position: relative;
          }

          .wan-auth-footer {
            margin-top: 32px;
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          /* 响应式设计 */
          @media (max-width: 1024px) {
            .wan-auth-container {
              flex-direction: column;
            }

            .wan-auth-brand,
            .wan-auth-form-container {
              max-width: 100%;
              flex: none;
            }

            .wan-auth-brand {
              padding: 60px 40px 40px;
            }

            .wan-auth-form-container {
              padding: 40px;
            }

            .wan-brand-title {
              font-size: 36px;
            }

            .wan-brand-features {
              flex-direction: row;
              justify-content: center;
              gap: 40px;
              margin-top: 40px;
            }
          }

          @media (max-width: 768px) {
            .wan-auth-form-container,
            .wan-auth-brand {
              padding: 24px;
            }

            .wan-auth-card {
              padding: 32px 24px;
            }

            .wan-brand-title {
              font-size: 28px;
            }

            .wan-brand-features {
              flex-direction: column;
              gap: 20px;
            }
          }
        `}</style>
      </App>
    </ConfigProvider>
  )
}

export default AuthLayout