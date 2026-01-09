/**
 * Universe Life Admin - 通用类型定义
 *
 * 定义跨模块共享的通用类型
 *
 * @author James
 * @version 1.0.0
 */

/**
 * 通用搜索表单值类型
 */
export interface SearchValues {
  [key: string]: string | number | boolean | undefined;
}

/**
 * 通用表格查询参数
 */
export interface TableParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
  [key: string]: any;
}

/**
 * 通用树形节点数据
 */
export interface TreeNode {
  title: string;
  key: string;
  value?: string;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * 通用API响应结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 通用分页响应
 */
export interface PageResponse<T = any> {
  records: T[];
  total: number;
  current: number;
  pageSize: number;
}
