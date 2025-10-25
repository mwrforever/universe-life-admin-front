/**
 * 路由配置
 */

import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Login from '../pages/auth/Login'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import Tasks from '../pages/Tasks'
import Payments from '../pages/Payments'
import Chat from '../pages/Chat'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'tasks',
        element: <Tasks />,
      },
      {
        path: 'payments',
        element: <Payments />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter