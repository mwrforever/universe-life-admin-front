/**
 * 系统模块通用类型定义
 */

// 通用状态
export const CommonStatus = {
  DISABLED: 0,
  ENABLED: 1,
} as const;
export type CommonStatus = typeof CommonStatus[keyof typeof CommonStatus];

// 用户状态
export const UserStatus = {
  DISABLED: 0,
  NORMAL: 1,
  LOCKED: 2,
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// 性别
export const Gender = {
  SECRET: 0,
  MALE: 1,
  FEMALE: 2,
} as const;
export type Gender = typeof Gender[keyof typeof Gender];

// 资源类型
export const ResourceType = {
  MENU: 0,
  BUTTON: 1,
  API: 2,
  DATA_PERMISSION: 3,
} as const;
export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

// 角色类型
export const RoleType = {
  SYSTEM: 0,
  BUSINESS: 1,
  CUSTOM: 2,
} as const;
export type RoleType = typeof RoleType[keyof typeof RoleType];

// 数据范围
export const DataScope = {
  ALL: 0,
  DEPARTMENT: 1,
  DEPARTMENT_AND_CHILD: 2,
  SELF: 3,
} as const;
export type DataScope = typeof DataScope[keyof typeof DataScope];

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}
