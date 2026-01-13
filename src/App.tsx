/**
 * Universe Life Admin - 主应用组件
 *
 * 基于宇宙概念的企业级管理后台
 * 集成 ProLayout 高级沉浸式布局和动态主题系统
 * 支持多页面路由导航和表单认证
 * 支持页面刷新后路由持久化
 *
 * @author James
 * @version 4.0.0 - 添加路由持久化支持
 */

import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ConfigProvider, Spin, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './context/ThemeContext'
import ProBasicLayout from './components/layout/ProBasicLayout'
import { useAuth } from './hooks/useAuth'
import { setAntdStaticInstances } from './utils/antdStatic'
import { routeConfig, DEFAULT_PATH } from './routes/routeConfig'
import { getPageKeyFromPathOrDefault, getPathFromPageKey, isValidPath } from './utils/routeUtils'
import './App.css'

// 懒加载页面组件 - 实现代码分割
const LoginPage = lazy(() => import('./pages/auth').then(m => ({ default: m.LoginPage })))

// 加载中组件
const LoadingFallback: React.FC = () => (
  <Spin size="large" tip="加载中..." fullscreen />
)

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  // ✅ 优化：如果token已经存在但用户信息还在加载，直接显示内容
  // 避免因为isLoading导致的闪烁
  if (isLoading && !isAuthenticated) {
    return <LoadingFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// 主布局组件（基于 URL 路由）
const MainLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 从 URL 路径获取当前页面 key
  const currentPage = getPageKeyFromPathOrDefault(location.pathname)

  // 处理页面切换 - 使用 navigate 更新 URL
  const handlePageChange = (pageKey: string) => {
    const path = getPathFromPageKey(pageKey)
    if (path) {
      navigate(path)
    }
  }

  return (
    <ProBasicLayout
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* 动态生成路由 */}
          {routeConfig.map(route => (
            <Route
              key={route.key}
              path={route.path}
              element={<route.component />}
            />
          ))}
          
          {/* 根路径重定向到默认页面 */}
          <Route path="/" element={<Navigate to={DEFAULT_PATH} replace />} />
          
          {/* 404 - 无效路径重定向到默认页面 */}
          <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
        </Routes>
      </Suspense>
    </ProBasicLayout>
  )
}

// antd 静态方法初始化组件
const AntdStaticInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message, notification, modal } = AntdApp.useApp();

  useEffect(() => {
    // 将 antd 静态方法实例注册到全局，供 axios 拦截器等非组件代码使用
    setAntdStaticInstances(message, notification, modal);
  }, [message, notification, modal]);

  return <>{children}</>;
};

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ConfigProvider locale={zhCN}>
          <AntdApp>
            <AntdStaticInitializer>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* 公开路由 */}
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LoginPage />
                    </Suspense>
                  }
                />

                {/* 受保护路由 - 使用通配符匹配所有路径 */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            </AntdStaticInitializer>
          </AntdApp>
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
