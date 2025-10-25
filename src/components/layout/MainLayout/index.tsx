/**
 * 万象生活主布局组件
 * 三大块结构：顶部导航栏 + 左侧侧边栏 + 右侧内容区域
 */

import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Badge, Button, Typography, Tooltip } from 'antd'
import { WanXiangIcon } from '@/components/icons'
import { useAppSelector } from '@/store'
import type { RootState } from '@/store'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
  path?: string
  children?: MenuItem[]
}

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state: RootState) => state.auth)

  // 菜单配置
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <WanXiangIcon type="Home" />,
      label: '工作台',
      path: '/dashboard'
    },
    {
      key: 'users',
      icon: <WanXiangIcon type="User" />,
      label: '用户管理',
      children: [
        { key: 'user-list', icon: <WanXiangIcon type="User" />, label: '用户列表', path: '/users' },
        { key: 'user-detail', icon: <WanXiangIcon type="User" />, label: '用户详情', path: '/users/detail' }
      ]
    },
    {
      key: 'tasks',
      icon: <WanXiangIcon type="Task" />,
      label: '任务管理',
      children: [
        { key: 'task-management', icon: <WanXiangIcon type="Task" />, label: '任务列表', path: '/tasks' },
        { key: 'task-create', icon: <WanXiangIcon type="Task" />, label: '创建任务', path: '/tasks/create' },
        { key: 'task-browse', icon: <WanXiangIcon type="Task" />, label: '浏览任务', path: '/tasks/browse' },
        { key: 'task-my', icon: <WanXiangIcon type="Task" />, label: '我的任务', path: '/tasks/my' }
      ]
    },
    {
      key: 'payments',
      icon: <WanXiangIcon type="Wallet" />,
      label: '支付管理',
      children: [
        { key: 'payment-management', icon: <WanXiangIcon type="Payment" />, label: '支付列表', path: '/payments' },
        { key: 'payment-transactions', icon: <WanXiangIcon type="Chart" />, label: '交易记录', path: '/payments/transactions' },
        { key: 'payment-banks', icon: <WanXiangIcon type="Security" />, label: '银行账户', path: '/payments/bank-accounts' }
      ]
    },
    {
      key: 'chat',
      icon: <WanXiangIcon type="Message" />,
      label: '消息中心',
      children: [
        { key: 'chat-list', icon: <WanXiangIcon type="Message" />, label: '消息列表', path: '/chat' },
        { key: 'chat-room', icon: <WanXiangIcon type="Message" />, label: '聊天室', path: '/chat/room' }
      ]
    },
    {
      key: 'reports',
      icon: <WanXiangIcon type="Chart" />,
      label: '报表统计',
      children: [
        { key: 'reports-list', icon: <WanXiangIcon type="Chart" />, label: '报表列表', path: '/reports' },
        { key: 'reports-analytics', icon: <WanXiangIcon type="Chart" />, label: '数据分析', path: '/reports/analytics' }
      ]
    },
    {
      key: 'admin',
      icon: <WanXiangIcon type="Settings" />,
      label: '系统管理',
      children: [
        { key: 'admin-dashboard', icon: <WanXiangIcon type="Settings" />, label: '管理面板', path: '/admin' },
        { key: 'admin-settings', icon: <WanXiangIcon type="Settings" />, label: '系统设置', path: '/admin/settings' },
        { key: 'admin-logs', icon: <WanXiangIcon type="Settings" />, label: '系统日志', path: '/admin/logs' }
      ]
    }
  ]

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <WanXiangIcon type="User" />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <WanXiangIcon type="Settings" />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <WanXiangIcon type="Settings" />,
      label: '退出登录',
      danger: true,
    },
  ]

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    const findMenuItem = (items: MenuItem[], targetKey: string): MenuItem | null => {
      for (const item of items) {
        if (item.key === targetKey && item.path) {
          return item
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetKey)
          if (found) return found
        }
      }
      return null
    }

    const menuItem = findMenuItem(menuItems, key)
    if (menuItem?.path) {
      navigate(menuItem.path)
    }
  }

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'logout':
        // TODO: 实现退出登录逻辑
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        navigate('/login')
        break
    }
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = (): string[] => {
    const path = location.pathname
    for (const item of menuItems) {
      if (item.path === path) {
        return [item.key]
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return [child.key]
          }
        }
      }
    }
    return []
  }

  // 获取展开的菜单项
  const getOpenKeys = (): string[] => {
    const path = location.pathname
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return [item.key]
          }
        }
      }
    }
    return []
  }

  return (
    <Layout className="wan-main-layout">
      {/* 顶部导航栏 */}
      <Header className="wan-main-header">
        <div className="wan-header-left">
          <Button
            type="text"
            icon={<WanXiangIcon type="Menu" />}
            onClick={() => setCollapsed(!collapsed)}
            className="wan-menu-toggle"
          />

          <div className="wan-header-logo">
            <div className="wan-logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="url(#header-gradient)" strokeWidth="2"/>
                <path d="M16 10v6l4 3" stroke="url(#header-gradient)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="wan-logo-text">万象生活</span>
          </div>
        </div>

        <div className="wan-header-right">
          {/* 通知铃铛 */}
          <Tooltip title="通知中心" placement="bottom">
            <Badge count={3} size="small" className="wan-notification-badge">
              <Button
                type="text"
                icon={<WanXiangIcon type="Notification" />}
                className="wan-header-icon-btn"
              />
            </Badge>
          </Tooltip>

          {/* 用户信息下拉菜单 */}
          <Dropdown
            menu={{
              items: userMenuItems as any,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div className="wan-user-info">
              <Avatar
                src={user?.avatar}
                className="wan-user-avatar"
                icon={<WanXiangIcon type="User" />}
              >
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="wan-user-details">
                <Text className="wan-user-name">{user?.username || '管理员'}</Text>
                <Text type="secondary" className="wan-user-role">
                  {user?.role === 'admin' ? '超级管理员' : '普通用户'}
                </Text>
              </div>
              <WanXiangIcon type="ArrowDown" size="16" />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* 左侧边栏 */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
          className="wan-main-sidebar"
        >
          <div className="wan-sidebar-header">
            {!collapsed && (
              <div className="wan-sidebar-title">
                <WanXiangIcon type="Home" color="var(--wan-primary-500)" />
                <span>系统导航</span>
              </div>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems as any}
            onClick={handleMenuClick}
            className="wan-sidebar-menu"
          />
        </Sider>

        {/* 右侧内容区域 */}
        <Layout className="wan-content-layout">
          <Content className="wan-main-content">
            <div className="wan-content-wrapper">
              {/* 面包屑导航 */}
              <div className="wan-content-breadcrumb">
                {/* TODO: 添加面包屑组件 */}
              </div>

              {/* 页面内容 */}
              <div className="wan-content-body">
                <Outlet />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* 自定义样式 */}
      <style>{`
        .wan-main-layout {
          min-height: 100vh;
          background: var(--wan-bg-secondary);
        }

        .wan-main-header {
          background: var(--wan-bg-primary);
          padding: 0;
          height: 64px;
          line-height: 64px;
          border-bottom: 1px solid var(--wan-neutral-200);
          box-shadow: var(--wan-shadow-small);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .wan-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-left: 16px;
        }

        .wan-menu-toggle {
          color: var(--wan-text-primary);
          border-radius: var(--wan-radius-medium);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wan-menu-toggle:hover {
          background: var(--wan-neutral-100);
          color: var(--wan-primary-500);
        }

        .wan-header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wan-logo-icon {
          display: flex;
          align-items: center;
        }

        .wan-logo-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--wan-text-primary);
          background: var(--wan-primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .wan-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-right: 24px;
        }

        .wan-notification-badge :global(.ant-badge-count) {
          background: var(--wan-warm-orange);
          border: 2px solid var(--wan-bg-primary);
        }

        .wan-header-icon-btn {
          color: var(--wan-text-secondary);
          border-radius: var(--wan-radius-medium);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wan-header-icon-btn:hover {
          background: var(--wan-neutral-100);
          color: var(--wan-primary-500);
        }

        .wan-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: var(--wan-radius-medium);
          cursor: pointer;
          transition: background var(--wan-transition-fast);
        }

        .wan-user-info:hover {
          background: var(--wan-neutral-100);
        }

        .wan-user-avatar {
          background: var(--wan-primary-500);
          border: 2px solid var(--wan-bg-primary);
          box-shadow: var(--wan-shadow-small);
        }

        .wan-user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .wan-user-name {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
          color: var(--wan-text-primary);
        }

        .wan-user-role {
          font-size: 12px;
          line-height: 1;
          color: var(--wan-text-tertiary);
        }

        .wan-main-sidebar {
          background: var(--wan-bg-primary);
          border-right: 1px solid var(--wan-neutral-200);
          box-shadow: var(--wan-shadow-small);
        }

        .wan-sidebar-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid var(--wan-neutral-200);
        }

        .wan-sidebar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 500;
          color: var(--wan-text-primary);
        }

        .wan-sidebar-menu {
          border-right: none;
          background: transparent;
          padding: 8px 0;
        }

        .wan-sidebar-menu :global(.ant-menu-item) {
          margin: 4px 12px;
          border-radius: var(--wan-radius-medium);
          height: 40px;
          line-height: 40px;
          display: flex;
          align-items: center;
          color: var(--wan-text-secondary);
        }

        .wan-sidebar-menu :global(.ant-menu-item:hover) {
          background: var(--wan-primary-50);
          color: var(--wan-primary-600);
        }

        .wan-sidebar-menu :global(.ant-menu-item-selected) {
          background: var(--wan-primary-100);
          color: var(--wan-primary-600);
          font-weight: 500;
        }

        .wan-sidebar-menu :global(.ant-menu-submenu-title) {
          margin: 4px 12px;
          border-radius: var(--wan-radius-medium);
          height: 40px;
          line-height: 40px;
          display: flex;
          align-items: center;
          color: var(--wan-text-secondary);
        }

        .wan-sidebar-menu :global(.ant-menu-submenu-title:hover) {
          background: var(--wan-primary-50);
          color: var(--wan-primary-600);
        }

        .wan-content-layout {
          background: var(--wan-bg-secondary);
        }

        .wan-main-content {
          padding: 0;
          background: var(--wan-bg-secondary);
        }

        .wan-content-wrapper {
          min-height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
        }

        .wan-content-breadcrumb {
          padding: 16px 24px 0;
          background: var(--wan-bg-secondary);
          border-bottom: 1px solid var(--wan-neutral-200);
        }

        .wan-content-body {
          flex: 1;
          padding: 24px;
          background: var(--wan-bg-secondary);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .wan-header-right {
            gap: 8px;
            padding-right: 16px;
          }

          .wan-user-details {
            display: none;
          }

          .wan-content-body {
            padding: 16px;
          }
        }

        @media (max-width: 576px) {
          .wan-header-left {
            padding-left: 12px;
          }

          .wan-logo-text {
            display: none;
          }

          .wan-content-breadcrumb {
            padding: 12px 16px 0;
          }

          .wan-content-body {
            padding: 12px;
          }
        }
      `}</style>
    </Layout>
  )
}

export default MainLayout