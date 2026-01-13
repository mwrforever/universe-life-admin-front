/**
 * 路由配置文件
 * 
 * 定义页面路径与组件的映射关系
 * 支持路径与页面 key 的双向转换
 * 
 * @author James
 * @version 1.0.0
 */

import React, { lazy } from 'react';

// 懒加载页面组件
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => import('../pages/System').then(m => ({ default: m.UserManagement })));
const ResourceManagement = lazy(() => import('../pages/System').then(m => ({ default: m.ResourceManagement })));
const RoleManagement = lazy(() => import('../pages/System').then(m => ({ default: m.RoleManagement })));
const DepartmentManagement = lazy(() => import('../pages/System').then(m => ({ default: m.DepartmentManagement })));
const EmployeeManagement = lazy(() => import('../pages/System').then(m => ({ default: m.EmployeeManagement })));
const TokenTestPage = lazy(() => import('../pages/auth').then(m => ({ default: m.TokenTestPage })));

/**
 * 路由配置接口
 */
export interface RouteConfig {
  /** URL 路径 */
  path: string;
  /** 页面标识符 */
  key: string;
  /** 页面组件 */
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  /** 子路由 */
  children?: RouteConfig[];
}

/**
 * 默认页面路径
 */
export const DEFAULT_PATH = '/dashboard';

/**
 * 默认页面 key
 */
export const DEFAULT_KEY = 'dashboard';

/**
 * 路由配置列表
 */
export const routeConfig: RouteConfig[] = [
  {
    path: '/dashboard',
    key: 'dashboard',
    component: Dashboard,
  },
  {
    path: '/system/user',
    key: 'system-user',
    component: UserManagement,
  },
  {
    path: '/system/resource',
    key: 'system-resource',
    component: ResourceManagement,
  },
  {
    path: '/system/role',
    key: 'system-role',
    component: RoleManagement,
  },
  {
    path: '/system/department',
    key: 'system-department',
    component: DepartmentManagement,
  },
  {
    path: '/system/employee',
    key: 'system-employee',
    component: EmployeeManagement,
  },
  {
    path: '/dev/token-test',
    key: 'dev-token-test',
    component: TokenTestPage,
  },
];

/**
 * 路径到 key 的映射表
 */
export const pathToKeyMap: Map<string, string> = new Map(
  routeConfig.map(route => [route.path, route.key])
);

/**
 * key 到路径的映射表
 */
export const keyToPathMap: Map<string, string> = new Map(
  routeConfig.map(route => [route.key, route.path])
);

/**
 * 所有有效路径集合
 */
export const validPaths: Set<string> = new Set(
  routeConfig.map(route => route.path)
);

/**
 * 所有有效 key 集合
 */
export const validKeys: Set<string> = new Set(
  routeConfig.map(route => route.key)
);
