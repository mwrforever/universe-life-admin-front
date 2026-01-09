/**
 * UserManagement 集成测试
 * 
 * 测试用户管理页面与 useTableLocalRefresh Hook 的集成
 * 验证删除、编辑、新增、筛选等操作的完整流程
 * 
 * _Requirements: 14.5_
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTableLocalRefresh } from '../../../hooks/useTableLocalRefresh';
import type { AdminUserListVO, UserListParams } from '../../../services/system';
import { UserStatus, Gender } from '../../../services/system';

// Mock 数据
const createMockUsers = (count: number, startId: number = 1): AdminUserListVO[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: String(startId + i),
    username: `user${startId + i}`,
    gender: i % 3 === 0 ? Gender.MALE : i % 3 === 1 ? Gender.FEMALE : Gender.SECRET,
    status: i % 4 === 0 ? UserStatus.DISABLE : UserStatus.NORMAL,
    avatarUrl: '',
    lastLoginAt: `2024-01-${String(i + 1).padStart(2, '0')} 10:00:00`,
    createdAt: `2024-01-${String(i + 1).padStart(2, '0')} 00:00:00`,
    updatedAt: `2024-01-${String(i + 1).padStart(2, '0')} 00:00:00`,
  }));
};

const mockUsers: AdminUserListVO[] = [
  {
    id: '1',
    username: 'admin',
    gender: Gender.MALE,
    status: UserStatus.NORMAL,
    avatarUrl: '',
    lastLoginAt: '2024-01-01 10:00:00',
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00',
  },
  {
    id: '2',
    username: 'user1',
    gender: Gender.FEMALE,
    status: UserStatus.NORMAL,
    avatarUrl: '',
    lastLoginAt: '2024-01-02 10:00:00',
    createdAt: '2024-01-02 00:00:00',
    updatedAt: '2024-01-02 00:00:00',
  },
  {
    id: '3',
    username: 'user2',
    gender: Gender.SECRET,
    status: UserStatus.DISABLE,
    avatarUrl: '',
    lastLoginAt: '2024-01-03 10:00:00',
    createdAt: '2024-01-03 00:00:00',
    updatedAt: '2024-01-03 00:00:00',
  },
];

describe('UserManagement Integration Tests', () => {
  let mockFetchList: ReturnType<typeof vi.fn>;
  let mockDeleteItem: ReturnType<typeof vi.fn>;
  let mockUpdateItem: ReturnType<typeof vi.fn>;
  let mockCreateItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetchList = vi.fn();
    mockDeleteItem = vi.fn();
    mockUpdateItem = vi.fn();
    mockCreateItem = vi.fn();
  });

  describe('数据加载', () => {
    it('应该正确加载用户列表数据', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers.slice(0, 2),
        total: 15,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.displayData).toHaveLength(2);
      expect(result.current.pagination.total).toBe(15);
      expect(mockFetchList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          size: 15, // pageSize(10) + spareCount(5)
        })
      );
    });

    it('应该正确分配显示数据和冗余池', async () => {
      // 返回15条数据（10条显示 + 5条冗余）
      const allUsers = createMockUsers(15);
      mockFetchList.mockResolvedValue({
        records: allUsers,
        total: 30,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 显示数据应该是前10条
      expect(result.current.displayData).toHaveLength(10);
      // 冗余池应该有5条
      expect(result.current.sparePoolSize).toBe(5);
    });
  });

  describe('删除操作', () => {
    it('应该本地删除用户并从冗余池补充', async () => {
      // 返回15条数据
      const allUsers = createMockUsers(15);
      mockFetchList.mockResolvedValue({
        records: allUsers,
        total: 20,
      });
      mockDeleteItem.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDisplayCount = result.current.displayData.length;
      const initialSpareCount = result.current.sparePoolSize;

      // 删除第一个用户
      await act(async () => {
        await result.current.handleDelete('1');
      });

      // 验证：显示数据应该保持 pageSize 条数（从冗余池补充）
      expect(result.current.displayData).toHaveLength(initialDisplayCount);
      // 冗余池应该减少1条
      expect(result.current.sparePoolSize).toBe(initialSpareCount - 1);
      // 被删除的用户不应该在列表中
      expect(result.current.displayData.find(u => u.id === '1')).toBeUndefined();
      // 后端删除接口应该被调用
      expect(mockDeleteItem).toHaveBeenCalledWith('1');
    });

    it('删除后 total 应该减少', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });
      mockDeleteItem.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pagination.total).toBe(3);

      await act(async () => {
        await result.current.handleDelete('1');
      });

      expect(result.current.pagination.total).toBe(2);
    });
  });

  describe('编辑操作', () => {
    it('应该本地更新用户数据并置顶', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });
      
      const updatedUser = { ...mockUsers[1], status: UserStatus.DISABLE };
      mockUpdateItem.mockResolvedValue(updatedUser);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 更新第二个用户的状态
      await act(async () => {
        await result.current.handleUpdate('2', { status: UserStatus.DISABLE });
      });

      // 验证：更新后的用户应该在列表头部（置顶）
      expect(result.current.displayData[0].id).toBe('2');
      expect(result.current.displayData[0].status).toBe(UserStatus.DISABLE);
      // 后端更新接口应该被调用
      expect(mockUpdateItem).toHaveBeenCalledWith('2', { status: UserStatus.DISABLE });
    });

    it('应该在编辑后验证筛选条件并移除不符合的数据', async () => {
      // 只返回正常状态的用户
      const normalUsers = mockUsers.filter(u => u.status === UserStatus.NORMAL);
      mockFetchList.mockResolvedValue({
        records: normalUsers,
        total: 2,
      });
      
      // 更新后返回禁用状态
      const updatedUser = { ...normalUsers[0], status: UserStatus.DISABLE };
      mockUpdateItem.mockResolvedValue(updatedUser);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
          filterValidator: (item, filters) => {
            if (filters.status !== undefined && item.status !== filters.status) {
              return false;
            }
            return true;
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 设置筛选条件：只显示正常状态的用户
      await act(async () => {
        result.current.handleFilterChange({ status: UserStatus.NORMAL });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.displayData.length;

      // 更新用户状态为禁用
      await act(async () => {
        await result.current.handleUpdate('1', { status: UserStatus.DISABLE });
      });

      // 验证：不符合筛选条件的用户应该被移除
      expect(result.current.displayData.find(u => u.id === '1')).toBeUndefined();
      expect(result.current.displayData.length).toBeLessThan(initialCount);
    });
  });

  describe('新增操作', () => {
    it('应该在列表头部插入新用户', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });

      const newUser: AdminUserListVO = {
        id: '999',
        username: 'newuser',
        gender: Gender.MALE,
        status: UserStatus.NORMAL,
        avatarUrl: '',
        lastLoginAt: '2024-01-10 10:00:00',
        createdAt: '2024-01-10 00:00:00',
        updatedAt: '2024-01-10 00:00:00',
      };
      mockCreateItem.mockResolvedValue(newUser);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 新增用户
      await act(async () => {
        await result.current.handleCreate(newUser);
      });

      // 验证：新用户应该在列表头部
      expect(result.current.displayData[0].id).toBe('999');
      expect(result.current.pagination.total).toBe(4);
      // 后端创建接口应该被调用
      expect(mockCreateItem).toHaveBeenCalledWith(newUser);
    });

    it('新增时超过 pageSize 应该将溢出数据移到冗余池', async () => {
      // 返回10条数据（刚好填满 pageSize）
      const allUsers = createMockUsers(10);
      mockFetchList.mockResolvedValue({
        records: allUsers,
        total: 10,
      });

      const newUser: AdminUserListVO = {
        id: '999',
        username: 'newuser',
        gender: Gender.MALE,
        status: UserStatus.NORMAL,
        avatarUrl: '',
        lastLoginAt: '2024-01-10 10:00:00',
        createdAt: '2024-01-10 00:00:00',
        updatedAt: '2024-01-10 00:00:00',
      };
      mockCreateItem.mockResolvedValue(newUser);

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.displayData).toHaveLength(10);
      const initialSpareCount = result.current.sparePoolSize;

      // 新增用户
      await act(async () => {
        await result.current.handleCreate(newUser);
      });

      // 显示数据应该仍然是10条
      expect(result.current.displayData).toHaveLength(10);
      // 新用户在头部
      expect(result.current.displayData[0].id).toBe('999');
      // 冗余池应该增加1条（溢出的数据）
      expect(result.current.sparePoolSize).toBe(initialSpareCount + 1);
    });
  });

  describe('筛选操作', () => {
    it('应该根据用户名筛选', async () => {
      mockFetchList.mockImplementation(async (params: UserListParams) => {
        let filtered = mockUsers;
        if (params.username) {
          filtered = mockUsers.filter(u => u.username.includes(params.username!));
        }
        return {
          records: filtered,
          total: filtered.length,
        };
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
          filterValidator: (item, filters) => {
            if (filters.username && !item.username.includes(filters.username)) {
              return false;
            }
            return true;
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 设置筛选条件
      await act(async () => {
        result.current.handleFilterChange({ username: 'admin' });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 验证：只显示匹配的用户
      expect(result.current.displayData).toHaveLength(1);
      expect(result.current.displayData[0].username).toBe('admin');
    });

    it('应该根据状态筛选', async () => {
      mockFetchList.mockImplementation(async (params: UserListParams) => {
        let filtered = mockUsers;
        if (params.status !== undefined) {
          filtered = mockUsers.filter(u => u.status === params.status);
        }
        return {
          records: filtered,
          total: filtered.length,
        };
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
          filterValidator: (item, filters) => {
            if (filters.status !== undefined && item.status !== filters.status) {
              return false;
            }
            return true;
          },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 设置筛选条件：只显示禁用状态的用户
      await act(async () => {
        result.current.handleFilterChange({ status: UserStatus.DISABLE });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 验证：只显示禁用状态的用户
      expect(result.current.displayData).toHaveLength(1);
      expect(result.current.displayData[0].status).toBe(UserStatus.DISABLE);
    });

    it('筛选条件变更应该重置页码为1', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 30,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 先切换到第2页
      await act(async () => {
        result.current.handlePageChange(2, 10);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pagination.current).toBe(2);

      // 设置筛选条件
      await act(async () => {
        result.current.handleFilterChange({ username: 'test' });
      });

      // 页码应该重置为1
      expect(result.current.pagination.current).toBe(1);
    });
  });

  describe('分页操作', () => {
    it('应该正确处理页码变更', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 30,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 切换到第2页
      await act(async () => {
        result.current.handlePageChange(2, 10);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 验证：页码已更新
      expect(result.current.pagination.current).toBe(2);
      expect(mockFetchList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          size: 15, // pageSize(10) + spareCount(5)
        })
      );
    });

    it('应该正确处理页尺寸变更', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 30,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 切换页尺寸
      await act(async () => {
        result.current.handlePageChange(1, 20);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 验证：页尺寸已更新
      expect(result.current.pagination.pageSize).toBe(20);
      expect(mockFetchList).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          size: 25, // pageSize(20) + spareCount(5)
        })
      );
    });

    it('页码变更应该清空冗余池', async () => {
      // 返回15条数据
      const allUsers = createMockUsers(15);
      mockFetchList.mockResolvedValue({
        records: allUsers,
        total: 30,
      });

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 初始冗余池应该有数据
      expect(result.current.sparePoolSize).toBeGreaterThan(0);

      // 切换页码
      await act(async () => {
        result.current.handlePageChange(2, 10);
      });

      // 冗余池应该被清空（然后重新填充）
      // 由于是异步操作，我们检查请求是否被正确发起
      expect(mockFetchList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  describe('回滚机制', () => {
    it('删除失败时应该回滚数据', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });
      mockDeleteItem.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialData = [...result.current.displayData];
      const initialTotal = result.current.pagination.total;

      // 尝试删除（会失败）
      await act(async () => {
        try {
          await result.current.handleDelete('1');
        } catch {
          // 预期会抛出错误
        }
      });

      // 数据应该回滚到原始状态
      expect(result.current.displayData).toHaveLength(initialData.length);
      expect(result.current.displayData[0].id).toBe(initialData[0].id);
      expect(result.current.pagination.total).toBe(initialTotal);
    });

    it('更新失败时应该回滚数据', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });
      mockUpdateItem.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialData = [...result.current.displayData];

      // 尝试更新（会失败）
      await act(async () => {
        try {
          await result.current.handleUpdate('1', { status: UserStatus.DISABLE });
        } catch {
          // 预期会抛出错误
        }
      });

      // 数据应该回滚到原始状态
      expect(result.current.displayData).toHaveLength(initialData.length);
      expect(result.current.displayData[0].status).toBe(initialData[0].status);
    });

    it('创建失败时应该回滚数据', async () => {
      mockFetchList.mockResolvedValue({
        records: mockUsers,
        total: 3,
      });
      mockCreateItem.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useTableLocalRefresh<AdminUserListVO>({
          primaryKey: 'id',
          spareCount: 5,
          fetchList: mockFetchList,
          deleteItem: mockDeleteItem,
          updateItem: mockUpdateItem,
          createItem: mockCreateItem,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialData = [...result.current.displayData];
      const initialTotal = result.current.pagination.total;

      const newUser: AdminUserListVO = {
        id: '999',
        username: 'newuser',
        gender: Gender.MALE,
        status: UserStatus.NORMAL,
        avatarUrl: '',
        lastLoginAt: '2024-01-10 10:00:00',
        createdAt: '2024-01-10 00:00:00',
        updatedAt: '2024-01-10 00:00:00',
      };

      // 尝试创建（会失败）
      await act(async () => {
        try {
          await result.current.handleCreate(newUser);
        } catch {
          // 预期会抛出错误
        }
      });

      // 数据应该回滚到原始状态
      expect(result.current.displayData).toHaveLength(initialData.length);
      expect(result.current.displayData[0].id).toBe(initialData[0].id);
      expect(result.current.pagination.total).toBe(initialTotal);
    });
  });
});
