/**
 * 表格局部刷新 Hook 类型定义
 * 提供通用的表格数据管理功能，支持本地秒级响应和智能数据补充
 */

// ==================== 核心配置类型 ====================

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  size: number;
}

/**
 * 筛选参数（可扩展）
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * 完整请求参数
 */
export interface FetchListParams extends PaginationParams, FilterParams {}

/**
 * 分页结果
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  current?: number;
  size?: number;
}

/**
 * Hook 配置
 */
export interface TableLocalRefreshConfig<T extends Record<string, any>> {
  /**
   * 主键字段名，默认 'id'
   */
  primaryKey?: keyof T;

  /**
   * 冗余数据条数，默认 5
   */
  spareCount?: number;

  /**
   * 筛选条件验证函数
   * @param item 数据项
   * @param filters 当前筛选条件
   * @returns 是否满足筛选条件
   */
  filterValidator?: (item: T, filters: Record<string, any>) => boolean;

  /**
   * 获取列表数据的 API 函数
   */
  fetchList: (params: FetchListParams) => Promise<PageResult<T>>;

  /**
   * 删除单条数据的 API 函数（可选）
   */
  deleteItem?: (id: string, ...args: any[]) => Promise<void>;

  /**
   * 批量删除数据的 API 函数（可选）
   */
  batchDelete?: (ids: string[], ...args: any[]) => Promise<void>;

  /**
   * 更新数据的 API 函数（可选）
   */
  updateItem?: (id: string, data: Partial<T>) => Promise<T>;

  /**
   * 创建数据的 API 函数（可选）
   */
  createItem?: (data: Partial<T>) => Promise<T>;

  /**
   * 防抖延迟（毫秒），默认 300
   */
  debounceDelay?: number;
}

// ==================== Hook 返回类型 ====================

/**
 * 分页信息
 */
export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * Hook 返回值
 */
export interface TableLocalRefreshReturn<T extends Record<string, any>> {
  /**
   * 显示数据（当前页面显示的数据）
   */
  displayData: T[];

  /**
   * 加载状态
   */
  loading: boolean;

  /**
   * 分页信息
   */
  pagination: PaginationInfo;

  /**
   * 删除单条数据
   */
  handleDelete: (id: string, ...args: any[]) => Promise<void>;

  /**
   * 批量删除数据
   */
  handleBatchDelete: (ids: string[], ...args: any[]) => Promise<void>;

  /**
   * 更新数据
   */
  handleUpdate: (id: string, data: Partial<T>) => Promise<void>;

  /**
   * 创建数据
   */
  handleCreate: (data: Partial<T>) => Promise<void>;

  /**
   * 页码或页尺寸变更
   */
  handlePageChange: (page: number, pageSize: number) => void;

  /**
   * 筛选条件变更
   * @param filters 新的筛选条件
   * @param forceRefresh 是否强制刷新（即使条件没变也发请求），默认 false
   */
  handleFilterChange: (filters: Record<string, any>, forceRefresh?: boolean) => void;

  /**
   * 手动刷新数据
   */
  refresh: () => Promise<void>;

  /**
   * 冗余池大小（用于调试）
   */
  sparePoolSize: number;
}

// ==================== 内部状态类型 ====================

/**
 * 状态快照（用于回滚）
 */
export interface StateSnapshot<T> {
  displayData: T[];
  sparePool: T[];
  pagination: PaginationInfo;
  timestamp: number;
}

/**
 * 待处理操作
 */
export interface PendingOperation {
  type: 'delete' | 'update' | 'create';
  id?: string;
  data?: any;
  timestamp: number;
}

/**
 * Hook 内部状态
 */
export interface TableState<T> {
  displayData: T[];
  sparePool: T[];
  snapshot: StateSnapshot<T> | null;
  loading: boolean;
  pagination: PaginationInfo;
  filters: Record<string, any>;
  pendingOperations: PendingOperation[];
}
