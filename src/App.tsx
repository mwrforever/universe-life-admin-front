/**
 * Universe Life Admin - 主应用组件
 *
 * 基于宇宙概念的企业级管理后台
 * 集成 ProLayout 高级沉浸式布局和动态主题系统
 * 支持多页面路由导航和表单认证
 *
 * @author James
 * @version 2.0.0
 */

import React, { useState, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './context/ThemeContext'
import ProBasicLayout from './components/layout/ProBasicLayout'
import Dashboard from './pages/Dashboard'
import {
  UserManagement as SystemUserManagement,
  ResourceManagement,
  RoleManagement,
  DepartmentManagement,
  EmployeeManagement,
} from './pages/System'
import { LoginPage } from './pages/auth'
import { useAuth } from './hooks/useAuth'
import './App.css'

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

// 页面组件映射
const pageComponents: Record<PageKey, React.ComponentType> = {
  dashboard: Dashboard,
  system: SystemUserManagement,
  'system-user': SystemUserManagement,
  'system-resource': ResourceManagement,
  'system-role': RoleManagement,
  'system-department': DepartmentManagement,
  'system-employee': EmployeeManagement,
} as Record<PageKey, React.ComponentType>

// 加载中组件
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
)

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
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
      {renderCurrentPage()}
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
              <Route path="/login" element={<LoginPage />} />
              
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