/**
 * Universe Life Admin - 主应用组件
 *
 * 基于宇宙概念的企业级管理后台
 * 集成 ProLayout 高级沉浸式布局和动态主题系统
 * 支持多页面路由导航
 *
 * @author James
 * @version 2.0.0
 */

import React, { useState } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { ThemeProvider } from './context/ThemeContext'
import ProBasicLayout from './components/layout/ProBasicLayout'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
// import TradeOrderCenter from './pages/TradeOrders'
import './App.css'

// 页面映射类型
type PageKey = 'dashboard' | 'users' | 'user-list' | 'orders' | 'settings'

// 页面组件映射
const pageComponents: Record<PageKey, React.ComponentType> = {
  dashboard: Dashboard,
  users: UserManagement,
  'user-list': UserManagement,
  // orders: TradeOrderCenter,
} as Record<PageKey, React.ComponentType>

// 主应用组件
function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard')

  // 渲染当前页面
  const renderCurrentPage = () => {
    const PageComponent = pageComponents[currentPage]
    return <PageComponent />
  }

  // 处理页面切换
  const handlePageChange = (pageKey: PageKey) => {
    setCurrentPage(pageKey)
  }

  return (
    <ThemeProvider>
      <ConfigProvider locale={zhCN}>
        <ProBasicLayout
          currentPage={currentPage}
          onPageChange={handlePageChange}
        >
          {renderCurrentPage()}
        </ProBasicLayout>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default App