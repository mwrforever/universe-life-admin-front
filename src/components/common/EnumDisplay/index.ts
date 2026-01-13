/**
 * 枚举展示组件导出入口
 */

// 组件导出
export { EnumDisplay, default as EnumDisplayDefault } from './EnumDisplay';
export { StatusBadge } from './StatusBadge';
export { GenderDisplay } from './GenderDisplay';
export { RoleTagList } from './RoleTagList';

// 类型导出
export type {
  DisplayVariant,
  DisplaySize,
  ThemeColors,
  EnumDisplayItem,
  EnumDisplayConfig,
  EnumDisplayProps,
  StatusBadgeProps,
  RoleTagListProps,
} from './types';

// 配置导出
export {
  userStatusConfig,
  commonStatusConfig,
  genderConfig,
  roleTypeConfig,
  resourceTypeConfig,
  getDefaultConfig,
} from './configs';

// 颜色预设导出
export {
  colorPresets,
  successColors,
  processingColors,
  warningColors,
  errorColors,
  defaultColors,
  infoColors,
  purpleColors,
  pinkColors,
} from './colorPresets';
export type { ColorPresetKey } from './colorPresets';
