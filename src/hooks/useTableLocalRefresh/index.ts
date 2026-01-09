/**
 * 表格局部刷新 Hook
 * 
 * 通用的表格数据管理解决方案，适用于所有 CRUD 页面
 * 核心特性：
 * - 预载冗余数据（多查5条当备胎）
 * - 本地秒级响应（删改本地立即回显）
 * - 网络异常自动回滚
 * - 智能数据清理
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  TableLocalRefreshConfig,
  TableLocalRefreshReturn,
  StateSnapshot,
  PaginationInfo,
  FetchListParams,
} from './types';

/**
 * 表格局部刷新 Hook
 * 
 * @template T 数据项类型
 * @param config Hook 配置
 * @returns Hook 返回值
 * 
 * @example
 * ```tsx
 * const {
 *   displayData,
 *   loading,
 *   pagination,
 *   handleDelete,
 *   handleUpdate,
 *   handleCreate,
 *   handlePageChange,
 *   handleFilterChange,
 * } = useTableLocalRefresh<AdminUserListVO>({
 *   primaryKey: 'id',
 *   spareCount: 5,
 *   filterValidator: (item, filters) => {
 *     if (filters.username && !item.username.includes(filters.username)) {
 *       return false;
 *     }
 *     return true;
 *   },
 *   fetchList: userApi.getUserList,
 *   deleteItem: userApi.deleteUser,
 *   updateItem: userApi.updateUser,
 *   createItem: userApi.createUser,
 * });
 * ```
 */
export function useTableLocalRefresh<T extends Record<string, any>>(
  config: TableLocalRefreshConfig<T>
): TableLocalRefreshReturn<T> {
  const {
    primaryKey = 'id' as keyof T,
    spareCount = 5,
    filterValidator,
    fetchList,
    deleteItem,
    batchDelete,
    updateItem,
    createItem,
    debounceDelay = 300,
  } = config;

  // ==================== 状态管理 ====================
  
  const [displayData, setDisplayData] = useState<T[]>([]);
  const [sparePool, setSparePool] = useState<T[]>([]);
  const [snapshot, setSnapshot] = useState<StateSnapshot<T> | null>(null);
  const [loading, setLoading] = useState(true); // 初始为 true，首次加载时显示
  const [pagination, setPagination] = useState<PaginationInfo>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<Record<string, any>>({});

  // ==================== 请求管理 ====================
  
  const pendingRequestRef = useRef<AbortController | null>(null);
  const supplementRequestRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== 辅助函数 ====================

  /**
   * 获取数据项的主键值
   */
  const getPrimaryKeyValue = useCallback((item: T): string => {
    const value = item[primaryKey];
    return String(value);
  }, [primaryKey]);

  /**
   * 验证数据项是否满足筛选条件
   */
  const validateItem = useCallback((item: T): boolean => {
    if (!filterValidator) {
      return true;
    }
    return filterValidator(item, filters);
  }, [filterValidator, filters]);

  /**
   * 去重：基于主键去除重复数据
   */
  const deduplicateByKey = useCallback((items: T[]): T[] => {
    const seen = new Set<string>();
    const result: T[] = [];
    
    for (const item of items) {
      const key = getPrimaryKeyValue(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    
    return result;
  }, [getPrimaryKeyValue]);

  /**
   * 限制冗余池大小（最多10条）
   */
  const trimSparePool = useCallback((pool: T[]): T[] => {
    if (pool.length <= 10) {
      return pool;
    }
    // 只保留前10条
    return pool.slice(0, 10);
  }, []);

  /**
   * 从冗余池补位
   * @param count 需要补充的数量
   * @returns 补充的数据
   */
  const fillFromSparePool = useCallback((count: number): T[] => {
    if (count <= 0 || sparePool.length === 0) {
      return [];
    }

    const fillCount = Math.min(count, sparePool.length);
    const filledItems = sparePool.slice(0, fillCount);
    const remainingPool = sparePool.slice(fillCount);

    // 更新冗余池
    setSparePool(remainingPool);

    return filledItems;
  }, [sparePool]);

  /**
   * 添加数据到冗余池
   * @param items 要添加的数据
   */
  const addToSparePool = useCallback((items: T[]) => {
    if (items.length === 0) {
      return;
    }

    setSparePool(prev => {
      const newPool = [...items, ...prev];
      // 去重
      const uniquePool = deduplicateByKey(newPool);
      // 限制大小
      return trimSparePool(uniquePool);
    });
  }, [deduplicateByKey, trimSparePool]);

  /**
   * 清空冗余池
   */
  const clearSparePool = useCallback(() => {
    setSparePool([]);
  }, []);

  /**
   * 请求补充数据
   * @param count 需要补充的数量（最多5条）
   */
  const fetchSupplement = useCallback(async (count: number) => {
    if (count <= 0) {
      return;
    }

    // 取消之前的补充请求
    if (supplementRequestRef.current) {
      supplementRequestRef.current.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    supplementRequestRef.current = abortController;

    try {
      // 计算需要请求的数据范围
      const currentDataCount = displayData.length;
      const startIndex = (pagination.current - 1) * pagination.pageSize + currentDataCount;
      
      // 请求补充数据（最多5条）
      const supplementCount = Math.min(count, 5);
      const params: FetchListParams = {
        page: Math.floor(startIndex / pagination.pageSize) + 1,
        size: supplementCount,
        ...filters,
      };

      const result = await fetchList(params);

      // 检查请求是否被取消
      if (abortController.signal.aborted) {
        return;
      }

      const supplementRecords = result.records || [];
      
      if (supplementRecords.length > 0) {
        // 添加到冗余池
        addToSparePool(supplementRecords);
      }

    } catch (error: any) {
      // 如果是取消请求，不显示错误
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      console.error('Failed to fetch supplement data:', error);
    } finally {
      supplementRequestRef.current = null;
    }
  }, [
    displayData.length,
    pagination.current,
    pagination.pageSize,
    filters,
    fetchList,
    addToSparePool,
  ]);

  // ==================== 数据请求逻辑 ====================

  /**
   * 请求列表数据（带冗余）
   * 请求 pageSize + spareCount 条数据
   */
  const fetchData = useCallback(async () => {
    console.log('🚀 fetchData started');
    
    // 取消之前的请求
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    pendingRequestRef.current = abortController;

    setLoading(true);

    try {
      // 请求 pageSize + spareCount 条数据
      const requestSize = pagination.pageSize + spareCount;
      const params: FetchListParams = {
        page: pagination.current,
        size: requestSize,
        ...filters,
      };

      console.log('📤 Calling fetchList with params:', params);
      const result = await fetchList(params);
      console.log('📥 fetchList result:', result);

      // 检查请求是否被取消
      if (abortController.signal.aborted) {
        return;
      }

      const allRecords = result.records || [];
      console.log('📊 allRecords:', allRecords, 'length:', allRecords.length);
      
      // 数据分配：前 pageSize 条作为显示数据，剩余存入冗余池
      const displayRecords = allRecords.slice(0, pagination.pageSize);
      const spareRecords = allRecords.slice(pagination.pageSize);

      console.log('📋 displayRecords:', displayRecords, 'spareRecords:', spareRecords);

      // 去重处理
      const uniqueDisplayData = deduplicateByKey(displayRecords);
      const uniqueSparePool = deduplicateByKey(spareRecords);

      // 限制冗余池大小
      const trimmedSparePool = trimSparePool(uniqueSparePool);

      console.log('✅ Setting displayData:', uniqueDisplayData);

      // 更新状态
      setDisplayData(uniqueDisplayData);
      setSparePool(trimmedSparePool);
      // 将 total 转换为数字，处理后端返回字符串的情况
      const totalNum = typeof result.total === 'string' ? parseInt(result.total, 10) : (result.total || 0);
      setPagination(prev => ({
        ...prev,
        total: totalNum || allRecords.length, // 如果 total 为 0，使用实际记录数
      }));

      console.log('✅ Data loaded successfully, displayData length:', uniqueDisplayData.length);

    } catch (error: any) {
      // 如果是取消请求，不显示错误
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      
      console.error('Failed to fetch data:', error);
      // 这里可以添加错误处理逻辑，如显示 toast
    } finally {
      // 无论成功还是失败，都要设置 loading 为 false
      // 只有在请求被取消时才不设置（因为会有新请求接管）
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
      pendingRequestRef.current = null;
    }
  }, [
    pagination.current,
    pagination.pageSize,
    spareCount,
    filters,
    fetchList,
    deduplicateByKey,
    trimSparePool,
  ]);

  // ==================== 快照和回滚机制 ====================

  /**
   * 创建当前状态的快照
   */
  const createSnapshot = useCallback((): StateSnapshot<T> => {
    return {
      displayData: [...displayData],
      sparePool: [...sparePool],
      pagination: { ...pagination },
      timestamp: Date.now(),
    };
  }, [displayData, sparePool, pagination]);

  /**
   * 恢复快照
   */
  const restoreSnapshot = useCallback((snap: StateSnapshot<T>) => {
    setDisplayData([...snap.displayData]);
    setSparePool([...snap.sparePool]);
    setPagination({ ...snap.pagination });
    setSnapshot(null);
  }, []);

  // ==================== CRUD 操作 ====================

  /**
   * 删除单条数据
   */
  const handleDelete = useCallback(async (id: string, ...args: any[]) => {
    if (!deleteItem) {
      console.warn('deleteItem function is not provided');
      return;
    }

    // 创建快照
    const snap = createSnapshot();
    setSnapshot(snap);

    try {
      // 本地立即移除数据
      const removedItem = displayData.find(item => getPrimaryKeyValue(item) === id);
      if (!removedItem) {
        return;
      }

      const newDisplayData = displayData.filter(item => getPrimaryKeyValue(item) !== id);
      setDisplayData(newDisplayData);

      // 从冗余池补位
      if (newDisplayData.length < pagination.pageSize && sparePool.length > 0) {
        const filled = fillFromSparePool(1);
        setDisplayData(prev => [...prev, ...filled]);
      }

      // 更新 total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      // 调用后端删除接口
      await deleteItem(id, ...args);

      // 检查是否需要补充数据
      const currentSpareCount = sparePool.length;
      const needSupplement = currentSpareCount < 5 && pagination.total > pagination.current * pagination.pageSize;
      
      if (needSupplement) {
        const supplementCount = Math.min(5 - currentSpareCount, 5);
        await fetchSupplement(supplementCount);
      }

      // 检查当前页是否为空且不是第一页
      if (newDisplayData.length === 0 && pagination.current > 1) {
        setPagination(prev => ({
          ...prev,
          current: prev.current - 1,
        }));
      }

      // 清除快照
      setSnapshot(null);

    } catch (error) {
      console.error('Failed to delete item:', error);
      // 回滚
      restoreSnapshot(snap);
      throw error;
    }
  }, [
    deleteItem,
    displayData,
    sparePool,
    pagination,
    createSnapshot,
    getPrimaryKeyValue,
    fillFromSparePool,
    fetchSupplement,
    restoreSnapshot,
  ]);

  /**
   * 批量删除数据
   */
  const handleBatchDelete = useCallback(async (ids: string[], ...args: any[]) => {
    if (!batchDelete) {
      console.warn('batchDelete function is not provided');
      return;
    }

    if (ids.length === 0) {
      return;
    }

    // 创建快照
    const snap = createSnapshot();
    setSnapshot(snap);

    try {
      // 本地批量移除数据
      const idsSet = new Set(ids);
      const newDisplayData = displayData.filter(item => !idsSet.has(getPrimaryKeyValue(item)));
      setDisplayData(newDisplayData);

      // 计算需要补位的数量
      const removedCount = displayData.length - newDisplayData.length;
      const needFillCount = Math.min(removedCount, pagination.pageSize - newDisplayData.length);

      // 从冗余池补位
      if (needFillCount > 0 && sparePool.length > 0) {
        const filled = fillFromSparePool(needFillCount);
        setDisplayData(prev => [...prev, ...filled]);
      }

      // 更新 total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - removedCount),
      }));

      // 调用后端批量删除接口
      await batchDelete(ids, ...args);

      // 一次性计算需要补充的数据量
      const currentSpareCount = sparePool.length;
      const needSupplement = currentSpareCount < 5 && pagination.total > pagination.current * pagination.pageSize;
      
      if (needSupplement) {
        const supplementCount = Math.min(5 - currentSpareCount, 5);
        await fetchSupplement(supplementCount);
      }

      // 检查当前页是否为空且不是第一页
      if (newDisplayData.length === 0 && pagination.current > 1) {
        setPagination(prev => ({
          ...prev,
          current: prev.current - 1,
        }));
      }

      // 清除快照
      setSnapshot(null);

    } catch (error) {
      console.error('Failed to batch delete items:', error);
      // 回滚
      restoreSnapshot(snap);
      throw error;
    }
  }, [
    batchDelete,
    displayData,
    sparePool,
    pagination,
    createSnapshot,
    getPrimaryKeyValue,
    fillFromSparePool,
    fetchSupplement,
    restoreSnapshot,
  ]);

  /**
   * 更新数据
   */
  const handleUpdate = useCallback(async (id: string, data: Partial<T>) => {
    if (!updateItem) {
      console.warn('updateItem function is not provided');
      return;
    }

    // 创建快照
    const snap = createSnapshot();
    setSnapshot(snap);

    try {
      // 找到要更新的数据
      const itemIndex = displayData.findIndex(item => getPrimaryKeyValue(item) === id);
      if (itemIndex === -1) {
        return;
      }

      // 调用后端更新接口
      const updatedItem = await updateItem(id, data);

      // 验证更新后的数据是否满足筛选条件
      const meetsFilter = validateItem(updatedItem);

      if (meetsFilter) {
        // 满足筛选条件，置顶显示
        const newDisplayData = [
          updatedItem,
          ...displayData.filter((_, index) => index !== itemIndex),
        ];
        setDisplayData(newDisplayData.slice(0, pagination.pageSize));

        // 如果有溢出的数据，放入冗余池
        if (newDisplayData.length > pagination.pageSize) {
          const overflow = newDisplayData.slice(pagination.pageSize);
          addToSparePool(overflow);
        }
      } else {
        // 不满足筛选条件，移除并补位
        const newDisplayData = displayData.filter((_, index) => index !== itemIndex);
        setDisplayData(newDisplayData);

        // 从冗余池补位
        if (newDisplayData.length < pagination.pageSize && sparePool.length > 0) {
          const filled = fillFromSparePool(1);
          setDisplayData(prev => [...prev, ...filled]);
        }

        // 如果冗余池为空，请求补充数据
        if (sparePool.length === 0) {
          await fetchSupplement(1);
        }
      }

      // 清除快照
      setSnapshot(null);

    } catch (error) {
      console.error('Failed to update item:', error);
      // 回滚
      restoreSnapshot(snap);
      throw error;
    }
  }, [
    updateItem,
    displayData,
    sparePool,
    pagination.pageSize,
    createSnapshot,
    getPrimaryKeyValue,
    validateItem,
    fillFromSparePool,
    addToSparePool,
    fetchSupplement,
    restoreSnapshot,
  ]);

  /**
   * 创建数据
   */
  const handleCreate = useCallback(async (data: Partial<T>) => {
    if (!createItem) {
      console.warn('createItem function is not provided');
      return;
    }

    // 创建快照
    const snap = createSnapshot();
    setSnapshot(snap);

    try {
      // 调用后端创建接口
      const newItem = await createItem(data);

      // 将新数据插入到显示数据头部
      const newDisplayData = [newItem, ...displayData];

      // 如果超过 pageSize，将最后一条移到冗余池
      if (newDisplayData.length > pagination.pageSize) {
        const overflow = newDisplayData.slice(pagination.pageSize);
        setDisplayData(newDisplayData.slice(0, pagination.pageSize));
        addToSparePool(overflow);
      } else {
        setDisplayData(newDisplayData);
      }

      // 更新 total
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
      }));

      // 清除快照
      setSnapshot(null);

    } catch (error) {
      console.error('Failed to create item:', error);
      // 回滚
      restoreSnapshot(snap);
      throw error;
    }
  }, [
    createItem,
    displayData,
    pagination.pageSize,
    createSnapshot,
    addToSparePool,
    restoreSnapshot,
  ]);

  /**
   * 页码或页尺寸变更
   */
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    // 取消未完成的请求
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
    }

    // 清空冗余池
    clearSparePool();

    // 更新分页信息
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }));

    // fetchData 会在 pagination 更新后自动触发
  }, [clearSparePool]);

  /**
   * 筛选条件变更
   * @param newFilters 新的筛选条件
   * @param forceRefresh 是否强制刷新（即使条件没变也发请求）
   */
  const handleFilterChange = useCallback((newFilters: Record<string, any>, forceRefresh: boolean = false) => {
    // 取消未完成的请求
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
    }

    // 清空冗余池
    clearSparePool();

    // 重置页码为1
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));

    // 更新筛选条件
    setFilters(newFilters);

    // 如果强制刷新，直接调用 fetchData
    if (forceRefresh) {
      // 使用 setTimeout 确保状态更新后再调用
      setTimeout(() => {
        fetchDataRef.current();
      }, 0);
    }

    // fetchData 会在 filters 更新后自动触发
  }, [clearSparePool]);

  // TODO: 实现手动刷新
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // ==================== 初始化数据加载 ====================

  // 使用 ref 存储最新的 fetchData 函数，避免 useEffect 依赖问题
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  // 使用 ref 跟踪请求参数，避免无限循环
  const prevParamsRef = useRef<{
    current: number;
    pageSize: number;
    filtersKey: string;
  } | null>(null);

  useEffect(() => {
    // 将 filters 对象转换为字符串进行比较
    const filtersKey = JSON.stringify(filters);
    const prevParams = prevParamsRef.current;
    
    const isFirstMount = prevParams === null;
    const paramsChanged = prevParams !== null && (
      prevParams.current !== pagination.current ||
      prevParams.pageSize !== pagination.pageSize ||
      prevParams.filtersKey !== filtersKey
    );

    console.log('🔄 useEffect triggered:', {
      isFirstMount,
      paramsChanged,
      pagination: { current: pagination.current, pageSize: pagination.pageSize },
      filtersKey,
      prevParams,
    });

    if (isFirstMount || paramsChanged) {
      prevParamsRef.current = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        filtersKey: filtersKey,
      };
      console.log('📡 Calling fetchData...');
      // 使用 ref 调用最新的 fetchData
      fetchDataRef.current();
    }
  }, [pagination.current, pagination.pageSize, filters]);

  // ==================== 组件卸载清理 ====================

  useEffect(() => {
    return () => {
      // 取消所有未完成的请求
      if (pendingRequestRef.current) {
        pendingRequestRef.current.abort();
      }
      if (supplementRequestRef.current) {
        supplementRequestRef.current.abort();
      }
      // 清除防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // ==================== 返回值 ====================

  return {
    displayData,
    loading,
    pagination,
    handleDelete,
    handleBatchDelete,
    handleUpdate,
    handleCreate,
    handlePageChange,
    handleFilterChange,
    refresh,
    sparePoolSize: sparePool.length,
  };
}

// 导出类型
export type {
  TableLocalRefreshConfig,
  TableLocalRefreshReturn,
  PaginationParams,
  FilterParams,
  FetchListParams,
  PageResult,
  PaginationInfo,
  StateSnapshot,
} from './types';
