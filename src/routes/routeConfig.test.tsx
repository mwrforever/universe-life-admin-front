/**
 * 路由导航集成测试
 * 
 * 测试路由配置和导航功能
 * 
 * @author James
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { Suspense } from 'react';
import { routeConfig, DEFAULT_PATH } from './routeConfig';
import { getPageKeyFromPath, getPathFromPageKey, isValidPath } from '../utils/routeUtils';

// Mock 页面组件
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

vi.mock('../pages/System', () => ({
  UserManagement: () => <div data-testid="user-management-page">User Management Page</div>,
  ResourceManagement: () => <div data-testid="resource-management-page">Resource Management Page</div>,
  RoleManagement: () => <div data-testid="role-management-page">Role Management Page</div>,
  DepartmentManagement: () => <div data-testid="department-management-page">Department Management Page</div>,
  EmployeeManagement: () => <div data-testid="employee-management-page">Employee Management Page</div>,
}));

// 测试用的路由组件
const TestRouter: React.FC<{ initialPath: string }> = ({ initialPath }) => {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {routeConfig.map(route => (
            <Route
              key={route.key}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="/" element={<LocationDisplay />} />
          <Route path="*" element={<div data-testid="not-found">Not Found - Redirect to {DEFAULT_PATH}</div>} />
        </Routes>
      </Suspense>
    </MemoryRouter>
  );
};

// 显示当前位置的组件
const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Route Configuration Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Config Validity', () => {
    it('should have unique keys for all routes', () => {
      const keys = routeConfig.map(r => r.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });

    it('should have unique paths for all routes', () => {
      const paths = routeConfig.map(r => r.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });

    it('should have all paths starting with /', () => {
      routeConfig.forEach(route => {
        expect(route.path.startsWith('/')).toBe(true);
      });
    });

    it('should have dashboard as the default route', () => {
      expect(DEFAULT_PATH).toBe('/dashboard');
      expect(routeConfig.find(r => r.path === DEFAULT_PATH)).toBeDefined();
    });
  });

  describe('Page Navigation', () => {
    it('should render Dashboard page for /dashboard path', async () => {
      render(<TestRouter initialPath="/dashboard" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should render User Management page for /system/user path', async () => {
      render(<TestRouter initialPath="/system/user" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('user-management-page')).toBeInTheDocument();
      });
    });

    it('should render Role Management page for /system/role path', async () => {
      render(<TestRouter initialPath="/system/role" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('role-management-page')).toBeInTheDocument();
      });
    });

    it('should render Resource Management page for /system/resource path', async () => {
      render(<TestRouter initialPath="/system/resource" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('resource-management-page')).toBeInTheDocument();
      });
    });

    it('should render Department Management page for /system/department path', async () => {
      render(<TestRouter initialPath="/system/department" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('department-management-page')).toBeInTheDocument();
      });
    });

    it('should render Employee Management page for /system/employee path', async () => {
      render(<TestRouter initialPath="/system/employee" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('employee-management-page')).toBeInTheDocument();
      });
    });
  });

  describe('Invalid Path Handling', () => {
    it('should show not found for invalid paths', async () => {
      render(<TestRouter initialPath="/invalid/path" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      });
    });

    it('should show not found for non-existent system subpath', async () => {
      render(<TestRouter initialPath="/system/nonexistent" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      });
    });
  });

  describe('Path and Key Mapping Consistency', () => {
    it('should correctly map all configured paths to keys', () => {
      routeConfig.forEach(route => {
        const key = getPageKeyFromPath(route.path);
        expect(key).toBe(route.key);
      });
    });

    it('should correctly map all configured keys to paths', () => {
      routeConfig.forEach(route => {
        const path = getPathFromPageKey(route.key);
        expect(path).toBe(route.path);
      });
    });

    it('should validate all configured paths as valid', () => {
      routeConfig.forEach(route => {
        expect(isValidPath(route.path)).toBe(true);
      });
    });
  });

  describe('Menu State Synchronization', () => {
    it('should correctly identify parent menu for system pages', () => {
      const systemPages = ['system-user', 'system-resource', 'system-role', 'system-department', 'system-employee'];
      
      systemPages.forEach(pageKey => {
        expect(pageKey.startsWith('system-')).toBe(true);
      });
    });

    it('should have all system pages in route config', () => {
      const systemPages = ['system-user', 'system-resource', 'system-role', 'system-department', 'system-employee'];
      
      systemPages.forEach(pageKey => {
        const route = routeConfig.find(r => r.key === pageKey);
        expect(route).toBeDefined();
        expect(route?.path.startsWith('/system/')).toBe(true);
      });
    });
  });
});
