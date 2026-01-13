/**
 * useUserDetail Hook 单元测试
 * 
 * 测试正常加载流程和错误处理
 * **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserDetail } from '../useUserDetail';
import { userDetailApi } from '@/services/system';

// Mock userDetailApi
vi.mock('@/services/system', () => ({
  userDetailApi: {
    getUserDetail: vi.fn(),
  },
}));

const mockUserDetail = {
  id: '1',
  bio: '这是用户简介',
  receiveOrder: 10,
  birthday: '1990-01-01',
  province: '广东省',
  city: '深圳市',
  country: '中国',
  road: '科技园路',
  address: '深圳市南山区科技园',
  createdAt: '2024-12-01T10:00:00',
  updatedAt: '2024-12-01T10:00:00',
};

describe('useUserDetail Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * 测试正常加载流程
   * **Validates: Requirements 2.2, 2.3**
   */
  describe('正常加载流程', () => {
    it('应该在有 userId 时加载用户详情', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValue({
        code: 1,
        message: 'success',
        data: mockUserDetail,
      } as any);

      const { result } = renderHook(() => 
        useUserDetail({ userId: '1' })
      );

      // 初始状态应该是 loading
      expect(result.current.loading).toBe(true);
      expect(result.current.detail).toBe(null);
      expect(result.current.error).toBe(null);

      // 等待加载完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 验证数据
      expect(result.current.detail).toEqual(mockUserDetail);
      expect(result.current.error).toBe(null);
      expect(userDetailApi.getUserDetail).toHaveBeenCalledWith('1');
    });

    it('userId 为 null 时不应该加载', () => {
      const { result } = renderHook(() => 
        useUserDetail({ userId: null })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.detail).toBe(null);
      expect(result.current.error).toBe(null);
      expect(userDetailApi.getUserDetail).not.toHaveBeenCalled();
    });

    it('enabled 为 false 时不应该加载', () => {
      const { result } = renderHook(() => 
        useUserDetail({ userId: '1', enabled: false })
      );

      expect(result.current.loading).toBe(false);
      expect(result.current.detail).toBe(null);
      expect(result.current.error).toBe(null);
      expect(userDetailApi.getUserDetail).not.toHaveBeenCalled();
    });
  });

  /**
   * 测试加载状态
   * **Validates: Requirements 2.4**
   */
  describe('加载状态', () => {
    it('加载过程中应该显示 loading 状态', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(userDetailApi.getUserDetail).mockReturnValue(promise as any);

      const { result } = renderHook(() => 
        useUserDetail({ userId: '1' })
      );

      // 应该处于 loading 状态
      expect(result.current.loading).toBe(true);

      // 解决 promise
      await act(async () => {
        resolvePromise!({
          code: 1,
          message: 'success',
          data: mockUserDetail,
        });
      });

      // 等待加载完成
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  /**
   * 测试错误处理
   * **Validates: Requirements 2.5**
   */
  describe('错误处理', () => {
    it('接口返回错误时应该设置 error', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValue({
        code: 0,
        message: '用户不存在',
        data: null,
      } as any);

      const { result } = renderHook(() => 
        useUserDetail({ userId: '999' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.detail).toBe(null);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('用户不存在');
    });

    it('接口抛出异常时应该设置 error', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockRejectedValue(
        new Error('网络错误')
      );

      const { result } = renderHook(() => 
        useUserDetail({ userId: '1' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.detail).toBe(null);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('网络错误');
    });

    it('错误不应该影响后续重新加载', async () => {
      // 第一次失败
      vi.mocked(userDetailApi.getUserDetail).mockRejectedValueOnce(
        new Error('网络错误')
      );

      const { result } = renderHook(() => 
        useUserDetail({ userId: '1' })
      );

      await waitFor(() => {
        expect(result.current.error).not.toBe(null);
      });

      // 第二次成功
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValueOnce({
        code: 1,
        message: 'success',
        data: mockUserDetail,
      } as any);

      // 重新加载
      await act(async () => {
        result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.detail).toEqual(mockUserDetail);
      expect(result.current.error).toBe(null);
    });
  });

  /**
   * 测试重新加载功能
   */
  describe('重新加载', () => {
    it('reload 应该重新获取数据', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValue({
        code: 1,
        message: 'success',
        data: mockUserDetail,
      } as any);

      const { result } = renderHook(() => 
        useUserDetail({ userId: '1' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userDetailApi.getUserDetail).toHaveBeenCalledTimes(1);

      // 重新加载
      await act(async () => {
        result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userDetailApi.getUserDetail).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * 测试 userId 变化
   */
  describe('userId 变化', () => {
    it('userId 变化时应该重新加载', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValue({
        code: 1,
        message: 'success',
        data: mockUserDetail,
      } as any);

      const { result, rerender } = renderHook(
        ({ userId }) => useUserDetail({ userId }),
        { initialProps: { userId: '1' as string | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userDetailApi.getUserDetail).toHaveBeenCalledWith('1');

      // 更改 userId
      rerender({ userId: '2' });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(userDetailApi.getUserDetail).toHaveBeenCalledWith('2');
    });

    it('userId 变为 null 时应该清空数据', async () => {
      vi.mocked(userDetailApi.getUserDetail).mockResolvedValue({
        code: 1,
        message: 'success',
        data: mockUserDetail,
      } as any);

      const { result, rerender } = renderHook(
        ({ userId }) => useUserDetail({ userId }),
        { initialProps: { userId: '1' as string | null } }
      );

      await waitFor(() => {
        expect(result.current.detail).toEqual(mockUserDetail);
      });

      // 更改 userId 为 null
      rerender({ userId: null });

      expect(result.current.detail).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
});
