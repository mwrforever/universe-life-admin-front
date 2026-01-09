/**
 * Universe Life Admin - 通用表格页面 Hook
 *
 * 封装管理页面的通用逻辑，减少重复代码
 *
 * @author James
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import type { TableParams, SearchValues } from '../types/common';

interface UseTablePageOptions {
  defaultPageSize?: number;
  defaultParams?: Partial<TableParams>;
}

/**
 * 通用表格页面 Hook
 * 提供分页、搜索等通用功能
 */
export const useTablePage = (options: UseTablePageOptions = {}) => {
  const { defaultPageSize = 10, defaultParams = {} } = options;

  // 表格参数
  const [params, setParams] = useState<TableParams>({
    current: 1,
    pageSize: defaultPageSize,
    ...defaultParams,
  });

  // 搜索表单值
  const [searchValues, setSearchValues] = useState<SearchValues>({});

  // 处理搜索
  const handleSearch = useCallback((values: SearchValues) => {
    setParams((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  // 处理搜索表单变化
  const handleSearchChange = useCallback((key: string, value: string | number | boolean | undefined) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // 重置搜索
  const resetSearch = useCallback(() => {
    setSearchValues({});
    setParams((prev) => ({ ...prev, current: 1, keyword: undefined }));
  }, []);

  // 处理分页变化
  const handlePageChange = useCallback((page: number, pageSize?: number) => {
    setParams((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  // 计算激活的搜索字段数量
  const activeSearchCount = useMemo(() => {
    return Object.values(searchValues).filter((v) => v !== undefined && v !== '').length;
  }, [searchValues]);

  return {
    // 状态
    params,
    searchValues,
    activeSearchCount,

    // 操作方法
    setParams,
    setSearchValues,
    handleSearch,
    handleSearchChange,
    resetSearch,
    handlePageChange,
  };
};
