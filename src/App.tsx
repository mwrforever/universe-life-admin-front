/**
 * Universe Life Admin - 主应用组件
 *
 * 基于宇宙概念的企业级管理后台
 * 集成 ProLayout 高级沉浸式布局和动态主题系统
 * 支持多页面路由导航和表单认证
 *
 * @author James
 * @version 3.0.0 - 添加路由懒加载优化
 */

import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './context/ThemeContext'
import ProBasicLayout from './components/layout/ProBasicLayout'
import { useAuth } from './hooks/useAuth'
import './App.css'

// 懒加载页面组件 - 实现代码分割
const LoginPage = lazy(() => import('./pages/auth').then(m => ({ default: m.LoginPage })))
const Dashboard = lazy(() => import('./pages/Dashboard'))

// System 模块页面懒加载
const UserManagement = lazy(() => import('./pages/System').then(m => ({ default: m.UserManagement })))
const ResourceManagement = lazy(() => import('./pages/System').then(m => ({ default: m.ResourceManagement })))
const RoleManagement = lazy(() => import('./pages/System').then(m => ({ default: m.RoleManagement })))
const DepartmentManagement = lazy(() => import('./pages/System').then(m => ({ default: m.DepartmentManagement })))
const EmployeeManagement = lazy(() => import('./pages/System').then(m => ({ default: m.EmployeeManagement })))

// 页面映射类型
type PageKey =
  | 'dashboard'
  | 'system'
  | 'system-user'
  | 'system-resource'
  | 'system-role'
  | 'system-department'
  | 'system-employee'
  | 'orders'
  | 'settings'

// 页面组件映射 - 使用懒加载组件
const pageComponents: Record<PageKey, React.LazyExoticComponent<React.ComponentType<any>>> = {
  dashboard: Dashboard as React.LazyExoticComponent<React.ComponentType<any>>,
  system: UserManagement,
  'system-user': UserManagement,
  'system-resource': ResourceManagement,
  'system-role': RoleManagement,
  'system-department': DepartmentManagement,
  'system-employee': EmployeeManagement,
} as Record<PageKey, React.LazyExoticComponent<React.ComponentType<any>>>

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

// 主布局组件（带页面切换）
const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')

  const renderCurrentPage = () => {
    const PageComponent = pageComponents[currentPage]
    return <PageComponent />
  }

  const handlePageChange = (pageKey: string) => {
    if (pageComponents[pageKey as PageKey]) {
      setCurrentPage(pageKey as PageKey)
    }
  }

  return (
    <ProBasicLayout
      currentPage={currentPage}
      onPageChange={handlePageChange}
    >
      <Suspense fallback={<LoadingFallback />}>
        {renderCurrentPage()}
      </Suspense>
    </ProBasicLayout>
  )
}

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ConfigProvider locale={zhCN}>
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

              {/* 受保护路由 */}
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
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App