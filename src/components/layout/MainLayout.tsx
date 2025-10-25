/**
 * 主布局组件 - 后台管理系统标准布局
 */

import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import SimpleGlobalSearch from '../GlobalSearch/SimpleGlobalSearch'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  BulbOutlined,
  MoonOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { themeMode, toggleTheme } = useTheme()

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      // 在小屏幕上自动折叠侧边栏
      if (width < 768 && !collapsed) {
        setCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [collapsed])

  // 菜单项配置
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'tasks',
      icon: <FileTextOutlined />,
      label: '任务管理',
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: '支付管理',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '聊天管理',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: '数据报表',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  // 菜单点击处理
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/${key}`)
    // 移动端点击菜单后自动收起
    if (isMobile) {
      setCollapsed(true)
    }
  }

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return ['dashboard']
    return [path.replace('/', '')]
  }

  // 主题相关样式
  const isDark = themeMode === 'dark'
  const colors = {
    background: isDark ? '#141414' : '#f5f7fa',
    sidebarBackground: isDark ? '#141414' : '#f5f7fa',
    headerBackground: isDark ? '#1f1f1f' : '#FFFFFF',
    contentBackground: isDark ? '#141414' : '#f5f7fa',
    activeItemBackground: isDark ? '#1f1f1f' : '#e6f4ff',
    activeItemText: isDark ? '#69b1ff' : '#096dd9',
    defaultText: isDark ? '#bfbfbf' : '#595959',
    hoverBackground: isDark ? '#262626' : '#d6e4ff',
    borderColor: isDark ? '#434343' : '#e8e8e8',
    headerText: isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.85)',
  }

  return (
    <Layout style={{
      minHeight: '100vh',
      background: colors.background
    }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        collapsedWidth={64}
        width={220}
        breakpoint="md"
        onBreakpoint={(broken) => {
          if (broken && !collapsed) {
            setCollapsed(true)
          }
        }}
        style={{
          background: colors.sidebarBackground,
          borderRight: `1px solid ${colors.borderColor}`,
          position: 'fixed',
          left: isMobile ? (collapsed ? -220 : 0) : 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 1000 : 100,
          transition: 'all 0.7s ease',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo 区域 */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${colors.borderColor}`,
          backdropFilter: 'blur(8px)',
        }}>
          {collapsed ? (
            <span style={{
              color: colors.headerText,
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}>
              🎯
            </span>
          ) : (
            <span style={{
              color: colors.headerText,
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🎯 万象生活
            </span>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          mode="inline"
          theme={isDark ? 'dark' : 'light'}
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '48px',
            paddingTop: '16px',
          }}
        />
      </Sider>

      {/* 移动端遮罩 */}
      {isMobile && !collapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
          }}
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* 主体内容区域 */}
      <Layout style={{
        marginLeft: isMobile ? 0 : (collapsed ? 64 : 220),
        transition: 'margin-left 0.7s ease',
        minHeight: '100vh'
      }}>
        {/* 顶部导航 */}
        <Header
          style={{
            height: '64px',
            padding: '0 24px',
            background: colors.headerBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.borderColor}`,
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* 左侧区域 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                color: colors.headerText,
              }}
            />
          </div>

          {/* 居中的全局搜索框 */}
          {!isMobile && (
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '64px'
            }}>
              <SimpleGlobalSearch />
            </div>
          )}

          {/* 右侧功能区 */}
          <Space size="middle">
            {/* 主题切换按钮 */}
            <Button
              type="text"
              icon={isDark ? <BulbOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{
                fontSize: '16px',
                color: colors.headerText,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: isDark ? '#262626' : '#f0f0f0',
              }}
              title={isDark ? '切换到浅色模式' : '切换到深色模式'}
            />

            {/* 通知铃铛 */}
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                style={{
                  border: 'none',
                  color: colors.headerText,
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: isDark ? '#262626' : '#f0f0f0',
                }}
              />
            </Badge>

            {/* 用户头像和下拉菜单 */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'transparent',
                transition: 'all 0.2s ease',
              }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: isDark ? '#69b1ff' : '#096dd9',
                  }}
                />
                <span style={{
                  fontWeight: 500,
                  color: colors.headerText
                }}>
                  管理员
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区域 - 固定侧边栏不滚动 */}
        <Content
          style={{
            margin: '24px',
            padding: '0',
            background: colors.contentBackground,
            minHeight: 'calc(100vh - 112px)',
            overflowY: 'auto',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout