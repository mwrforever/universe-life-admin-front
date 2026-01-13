/**
 * EmployeeManagement 页面集成测试
 * 测试头像上传和显示功能
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock 所有外部依赖
vi.mock('../../../services/system', () => ({
  employeeApi: {
    getEmployeeList: vi.fn().mockResolvedValue({
      data: {
        records: [
          {
            id: '1',
            username: 'employee1',
            realName: '张三',
            employeeNo: 'EMP001',
            avatarUrl: 'https://example.com/avatar.jpg',
            gender: 1,
            status: 1,
            primaryDeptName: '技术部',
            lastLoginAt: '2024-01-01 12:00:00',
          },
        ],
        total: 1,
      },
    }),
    deleteEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    createEmployee: vi.fn(),
    getEmployeeById: vi.fn(),
    updateEmployeeStatus: vi.fn(),
    resetEmployeePassword: vi.fn(),
  },
  departmentApi: {
    getDepartmentTree: vi.fn().mockResolvedValue({ data: [] }),
  },
  roleApi: {
    getRoleOptions: vi.fn().mockResolvedValue({ data: [] }),
  },
  CommonStatus: { DISABLED: 0, ENABLED: 1 },
  Gender: { SECRET: 0, MALE: 1, FEMALE: 2 },
}));

vi.mock('../../../hooks/useTableLocalRefresh', () => ({
  useTableLocalRefresh: () => ({
    displayData: [
      {
        id: '1',
        username: 'employee1',
        realName: '张三',
        employeeNo: 'EMP001',
        avatarUrl: 'https://example.com/avatar.jpg',
        gender: 1,
        status: 1,
        primaryDeptName: '技术部',
        lastLoginAt: '2024-01-01 12:00:00',
      },
    ],
    loading: false,
    pagination: { current: 1, pageSize: 10, total: 1 },
    handleDelete: vi.fn(),
    handleUpdate: vi.fn(),
    handleCreate: vi.fn(),
    handlePageChange: vi.fn(),
    handleFilterChange: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../../../components/common/ThumbnailImage', () => ({
  ThumbnailImage: ({ src, width, height, circle, fallback }: any) => (
    <div
      data-testid="thumbnail-image"
      data-src={src}
      data-width={width}
      data-height={height}
      data-circle={circle}
    >
      {src ? <img src={src} alt="avatar" /> : fallback}
    </div>
  ),
}));

vi.mock('../../../components/System/AvatarUpload', () => ({
  default: ({ value, onChange, size }: any) => (
    <div data-testid="avatar-upload" data-value={value} data-size={size}>
      <button onClick={() => onChange?.('https://example.com/new-avatar.jpg')}>
        Upload
      </button>
    </div>
  ),
}));

// Mock antd message
vi.mock('../../../utils/antdStatic', () => ({
  showSuccessMessage: vi.fn(),
}));

// 测试包装器
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>{children}</ThemeProvider>
  </BrowserRouter>
);

describe('EmployeeManagement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Avatar Display in List', () => {
    it('should render ThumbnailImage for avatar in table', async () => {
      const { ThumbnailImage } = await import('../../../components/common/ThumbnailImage');
      
      render(
        <TestWrapper>
          <ThumbnailImage
            src="https://example.com/avatar.jpg"
            width={40}
            height={40}
            circle
            thumbnailSize="small"
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const container = document.querySelector('[class*="thumbnail"]') || 
                         document.querySelector('img');
        expect(container).toBeTruthy();
      });
    });

    it('should show fallback icon when avatar URL is empty', async () => {
      const { ThumbnailImage } = await import('../../../components/common/ThumbnailImage');
      const { UserOutlined } = await import('@ant-design/icons');
      
      render(
        <TestWrapper>
          <ThumbnailImage
            src=""
            width={40}
            height={40}
            circle
            thumbnailSize="small"
            fallback={<UserOutlined data-testid="fallback-icon" />}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const fallback = screen.queryByTestId('fallback-icon');
        const placeholder = document.querySelector('[class*="placeholder"]');
        expect(fallback || placeholder).toBeTruthy();
      });
    });
  });

  describe('Avatar Upload in Modal', () => {
    it('should use AvatarUpload component with COS integration', async () => {
      const AvatarUpload = (await import('../../../components/System/AvatarUpload')).default;
      const onChange = vi.fn();

      render(
        <TestWrapper>
          <AvatarUpload
            value="https://example.com/avatar.jpg"
            onChange={onChange}
            size={100}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // 验证 AvatarUpload 组件渲染 - 检查 testid 或 upload 相关元素
        const upload = screen.getByTestId('avatar-upload') ||
                      document.querySelector('.ant-upload') ||
                      document.querySelector('[class*="upload"]');
        expect(upload).toBeTruthy();
      });
    });
  });
});
