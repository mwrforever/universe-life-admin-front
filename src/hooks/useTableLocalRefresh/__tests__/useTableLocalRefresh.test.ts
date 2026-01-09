/**
 * useTableLocalRefresh Hook 单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTableLocalRefresh } from '../index';
import type { TableLocalRefreshConfig, PageResult } from '../types';

// ==================== 测试数据类型 ====================

interface TestUser {
  id: string;
  username: string;
  status: number;
  gender: number;
}

// ==================== Mock API 函数 ====================

const createMockFetchList = (data: TestUser[], total: number) => {
  return vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
    const { page = 1, size = 10 } = params;
    const start = (page - 1) * size;
    const end = start + size;
    return {
      records: data.slice(start, end),
      total,
      current: page,
      size,
    };
  });
};

const createMockDeleteItem = () => {
  return vi.fn(async (id: string) => {
    // Mock 删除成功
  });
};

const createMockUpdateItem = (data: TestUser[]) => {
  return vi.fn(async (id: string, updates: Partial<TestUser>) => {
    const item = data.find(d => d.id === id);
    return { ...item, ...updates } as TestUser;
  });
};

const createMockCreateItem = () => {
  return vi.fn(async (data: Partial<TestUser>) => {
    return { id: 'new-id', ...data } as TestUser;
  });
};

// ==================== 测试数据 ====================

const createTestUsers = (count: number): TestUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    username: `user${i + 1}`,
    status: i % 2,
    gender: i % 3,
  }));
};

// ==================== 测试套件 ====================

describe('useTableLocalRefresh', () => {
  describe('初始化', () => {
    it('should initialize with default values', async () => {
      const mockFetchList = createMockFetchList([], 0);
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.displayData).toEqual([]);
      expect(result.current.pagination).toEqual({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      expect(result.current.sparePoolSize).toBe(0);
    });

    it('should load initial data', async () => {
      const testUsers = createTestUsers(15);
      const mockFetchList = createMockFetchList(testUsers, 15);
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        primaryKey: 'id',
        spareCount: 5,
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 显示数据应该是前10条
      expect(result.current.displayData).toHaveLength(10);
      // 冗余池应该有5条
      expect(result.current.sparePoolSize).toBe(5);
      // total 应该是15
      expect(result.current.pagination.total).toBe(15);
    });
  });

  describe('删除操作', () => {
    it('should delete item and fill from spare pool', async () => {
      const testUsers = createTestUsers(15);
      const mockFetchList = createMockFetchList(testUsers, 15);
      const mockDeleteItem = createMockDeleteItem();
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        deleteItem: mockDeleteItem,
        primaryKey: 'id',
        spareCount: 5,
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialDisplayCount = result.current.displayData.length;
      const initialSpareCount = result.current.sparePoolSize;

      // 删除第一条数据
      await act(async () => {
        await result.current.handleDelete('user-1');
      });

      // 显示数据应该保持不变（从冗余池补充）
      expect(result.current.displayData).toHaveLength(initialDisplayCount);
      // 冗余池应该减少1条
      expect(result.current.sparePoolSize).toBe(initialSpareCount - 1);
      // 被删除的数据不应该在列表中
      expect(result.current.displayData.find(u => u.id === 'user-1')).toBeUndefined();
      // 后端删除接口应该被调用
      expect(mockDeleteItem).toHaveBeenCalledWith('user-1');
    });
  });

  describe('编辑操作', () => {
    it('should update item and move to top', async () => {
      const testUsers = createTestUsers(10);
      const mockFetchList = createMockFetchList(testUsers, 10);
      const mockUpdateItem = createMockUpdateItem(testUsers);
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        updateItem: mockUpdateItem,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 更新第5条数据
      await act(async () => {
        await result.current.handleUpdate('user-5', { username: 'updated-user' });
      });

      // 更新后的数据应该在列表头部
      expect(result.current.displayData[0].id).toBe('user-5');
      expect(result.current.displayData[0].username).toBe('updated-user');
    });
  });

  describe('新增操作', () => {
    it('should create item and insert at top', async () => {
      const testUsers = createTestUsers(5);
      const mockFetchList = createMockFetchList(testUsers, 5);
      const mockCreateItem = createMockCreateItem();
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        createItem: mockCreateItem,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialTotal = result.current.pagination.total;

      // 新增数据
      await act(async () => {
        await result.current.handleCreate({ username: 'new-user', status: 0, gender: 1 });
      });

      // 新数据应该在列表头部
      expect(result.current.displayData[0].id).toBe('new-id');
      expect(result.current.displayData[0].username).toBe('new-user');
      // total 应该增加1
      expect(result.current.pagination.total).toBe(initialTotal + 1);
    });
  });

  describe('分页操作', () => {
    it('should handle page change', async () => {
      const testUsers = createTestUsers(30);
      const mockFetchList = createMockFetchList(testUsers, 30);
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

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

      // 页码应该更新
      expect(result.current.pagination.current).toBe(2);
    });
  });

  describe('筛选操作', () => {
    it('should handle filter change and reset page', async () => {
      const testUsers = createTestUsers(30);
      const mockFetchList = createMockFetchList(testUsers, 30);
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

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
        result.current.handleFilterChange({ status: 1 });
      });

      // 页码应该重置为1
      expect(result.current.pagination.current).toBe(1);
    });
  });

  describe('回滚机制', () => {
    it('should rollback on delete failure', async () => {
      const testUsers = createTestUsers(10);
      const mockFetchList = createMockFetchList(testUsers, 10);
      const mockDeleteItem = vi.fn(async () => {
        throw new Error('Delete failed');
      });
      
      const config: TableLocalRefreshConfig<TestUser> = {
        fetchList: mockFetchList,
        deleteItem: mockDeleteItem,
        primaryKey: 'id',
      };

      const { result } = renderHook(() => useTableLocalRefresh(config));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialData = [...result.current.displayData];
      const initialTotal = result.current.pagination.total;

      // 尝试删除（会失败）
      await act(async () => {
        try {
          await result.current.handleDelete('user-1');
        } catch {
          // 预期会失败
        }
      });

      // 数据应该回滚
      expect(result.current.displayData).toHaveLength(initialData.length);
      expect(result.current.displayData[0].id).toBe(initialData[0].id);
      expect(result.current.pagination.total).toBe(initialTotal);
    });
  });
});
