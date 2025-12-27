/**
 * 系统模块 API 统一导出
 */

// 导出类型
export * from './types';

// 导出API默认对象
export { default as userApi } from './userApi';
export { default as resourceApi } from './resourceApi';
export { default as roleApi } from './roleApi';
export { default as departmentApi } from './departmentApi';
export { default as employeeApi } from './employeeApi';

// 导出各模块接口类型
export type {
  UserListParams,
  AdminUserDetailVO,
  AdminUserListVO,
  CreateUserRequest,
  UpdateUserRequest,
} from './userApi';

export type {
  ResourceListParams,
  ResourceDetailVO,
  ResourceListVO,
  ResourceTreeVO,
  CreateResourceRequest,
  UpdateResourceRequest,
} from './resourceApi';

export type {
  RoleListParams,
  RoleDetailVO,
  RoleListVO,
  RoleOptionVO,
  CreateRoleRequest,
  UpdateRoleRequest,
} from './roleApi';

export type {
  DepartmentListParams,
  DepartmentDetailVO,
  DepartmentListVO,
  DepartmentTreeVO,
  DepartmentOptionVO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from './departmentApi';

export type {
  EmployeeListParams,
  SysUserDetailVO,
  SysUserListVO,
  SysUserOptionVO,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from './employeeApi';
