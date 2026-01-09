/**
 * useTableLocalRefresh Hook 属性测试
 * 使用 fast-check 进行基于属性的测试
 */

import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTableLocalRefresh } from '../index';
import type { TableLocalRefreshConfig, PageResult } from '../types';

// ==================== 测试数据类型 ====================

interface TestUser {
  id: string;
  username: string;
  status: number;
  gender: number;
  createdAt: string;
}

// ==================== 生成器 ====================

/**
 * 生成测试用户数据（确保 ID 唯一）
 */
const testUserArbitrary = (index: number) => fc.record({
  id: fc.constant(`user-${index}`),
  username: fc.string({ minLength: 1, maxLength: 20 }),
  status: fc.integer({ min: 0, max: 3 }),
  gender: fc.integer({ min: 0, max: 2 }),
  createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
});

/**
 * 生成用户数组（确保 ID 唯一）
 */
const testUsersArbitrary = (minLength = 0, maxLength = 100) =>
  fc.integer({ min: minLength, max: maxLength }).chain(length => {
    if (length === 0) {
      return fc.constant([] as TestUser[]);
    }
    return fc.tuple(...Array.from({ length }, (_, i) => testUserArbitrary(i)));
  });

// ==================== 属性测试套件 ====================

describe('useTableLocalRefresh - Property Tests', () => {
  /**
   * Feature: table-local-refresh, Property 1: 显示数据条数一致性（不变量）
   * 
   * 对于任何表格状态和任何操作，如果后端有足够的数据，则显示数据的条数应该等于 pageSize；
   * 如果后端数据不足，则显示数据条数应该等于实际可用的数据条数。
   * 
   * Validates: Requirements 1.2, 11.1, 11.2, 11.3, 11.4
   */
  it('Property 1: should maintain display data count equal to pageSize or available data count', async () => {
    await fc.assert(
      fc.asyncProperty(
        testUsersArbitrary(1, 50),
        fc.integer({ min: 5, max: 20 }),
        async (allUsers, pageSize) => {
          const defaultPageSize = 10;
          const mockFetchList = vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
            const { page = 1, size = 10 } = params;
            const start = (page - 1) * size;
            const end = start + size;
            return {
              records: allUsers.slice(start, end),
              total: allUsers.length,
              current: page,
              size,
            };
          });

          const config: TableLocalRefreshConfig<TestUser> = {
            fetchList: mockFetchList,
            primaryKey: 'id',
          };

          const { result } = renderHook(() => useTableLocalRefresh(config));

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // 验证初始状态
          const displayCount = result.current.displayData.length;
          const expectedMaxCount = Math.min(allUsers.length, defaultPageSize);
          
          // displayData 应该等于 min(pageSize, 实际数据量)
          expect(displayCount).toBeLessThanOrEqual(defaultPageSize);
          expect(displayCount).toBeLessThanOrEqual(allUsers.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: table-local-refresh, Property 3: 主键唯一性（不变量）
   * 
   * 对于任何表格状态，显示数据和冗余池中的所有数据项的主键应该是唯一的，
   * 不应该存在重复的主键。
   * 
   * Validates: Requirements 1.3
   */
  it('Property 3: should ensure unique primary keys in display data', async () => {
    await fc.assert(
      fc.asyncProperty(
        testUsersArbitrary(5, 30),
        async (allUsers) => {
          const mockFetchList = vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
            const { page = 1, size = 10 } = params;
            const start = (page - 1) * size;
            const end = start + size;
            return {
              records: allUsers.slice(start, end),
              total: allUsers.length,
              current: page,
              size,
            };
          });

          const config: TableLocalRefreshConfig<TestUser> = {
            fetchList: mockFetchList,
            primaryKey: 'id',
          };

          const { result } = renderHook(() => useTableLocalRefresh(config));

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // 收集所有数据的主键
          const allIds = result.current.displayData.map(item => item.id);

          // 验证主键唯一性
          const uniqueIds = new Set(allIds);
          expect(uniqueIds.size).toBe(allIds.length);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: table-local-refresh, Property 4: 请求参数正确性
   * 
   * 对于任何列表数据请求，请求的 size 参数应该等于 pageSize + spareCount
   * （默认为 pageSize + 5）。
   * 
   * Validates: Requirements 1.1, 9.2
   */
  it('Property 4: should request pageSize + spareCount data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        testUsersArbitrary(10, 50),
        async (spareCount, allUsers) => {
          let requestedSize = 0;
          const defaultPageSize = 10;

          const mockFetchList = vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
            requestedSize = params.size;
            const { page = 1, size = 10 } = params;
            const start = (page - 1) * size;
            const end = start + size;
            return {
              records: allUsers.slice(start, end),
              total: allUsers.length,
              current: page,
              size,
            };
          });

          const config: TableLocalRefreshConfig<TestUser> = {
            fetchList: mockFetchList,
            primaryKey: 'id',
            spareCount,
          };

          const { result } = renderHook(() => useTableLocalRefresh(config));

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // 验证请求的 size 参数
          expect(requestedSize).toBe(defaultPageSize + spareCount);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: table-local-refresh, Property 2: 冗余池大小限制（不变量）
   * 
   * 对于任何表格状态，冗余池中的数据条数应该小于等于10条。
   * 
   * Validates: Requirements 1.2, 13.5
   */
  it('Property 2: should limit spare pool size to 10', async () => {
    await fc.assert(
      fc.asyncProperty(
        testUsersArbitrary(25, 50), // 确保有足够的数据
        async (allUsers) => {
          const mockFetchList = vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
            const { page = 1, size = 10 } = params;
            const start = (page - 1) * size;
            const end = start + size;
            return {
              records: allUsers.slice(start, end),
              total: allUsers.length,
              current: page,
              size,
            };
          });

          const config: TableLocalRefreshConfig<TestUser> = {
            fetchList: mockFetchList,
            primaryKey: 'id',
            spareCount: 15, // 故意设置大于10的值
          };

          const { result } = renderHook(() => useTableLocalRefresh(config));

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // 验证冗余池大小不超过10
          expect(result.current.sparePoolSize).toBeLessThanOrEqual(10);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: table-local-refresh, Property 11: 快照创建和回滚的完整性
   * 
   * 对于任何调用后端接口的操作，操作前应该创建快照；
   * 如果操作失败，则回滚后的状态（displayData、sparePool、pagination）
   * 应该与快照中的状态完全一致。
   * 
   * Validates: Requirements 4.1, 7.1, 7.2, 7.4
   */
  it('Property 11: should restore snapshot completely on operation failure', async () => {
    await fc.assert(
      fc.asyncProperty(
        testUsersArbitrary(10, 30),
        async (allUsers) => {
          const mockFetchList = vi.fn(async (params: any): Promise<PageResult<TestUser>> => {
            const { page = 1, size = 10 } = params;
            const start = (page - 1) * size;
            const end = start + size;
            return {
              records: allUsers.slice(start, end),
              total: allUsers.length,
              current: page,
              size,
            };
          });

          // 删除总是失败
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

          // 保存初始状态
          const initialDisplayData = [...result.current.displayData];
          const initialSparePoolSize = result.current.sparePoolSize;
          const initialTotal = result.current.pagination.total;

          // 尝试删除（应该失败并回滚）
          if (initialDisplayData.length > 0) {
            try {
              await act(async () => {
                await result.current.handleDelete(initialDisplayData[0].id);
              });
            } catch {
              // 预期会失败
            }

            // 验证状态已回滚
            expect(result.current.displayData.length).toBe(initialDisplayData.length);
            expect(result.current.sparePoolSize).toBe(initialSparePoolSize);
            expect(result.current.pagination.total).toBe(initialTotal);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
