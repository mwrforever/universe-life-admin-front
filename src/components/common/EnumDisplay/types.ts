/**
 * 枚举展示组件类型定义
 */
import { ReactNode } from 'react';

/** 展示变体类型 */
export type DisplayVariant = 'tag' | 'badge' | 'dot' | 'text';

/** 组件尺寸 */
export type DisplaySize = 'small' | 'default' | 'large';

/** 主题颜色配置 */
export interface ThemeColors {
  light: {
    background: string;
    text: string;
    border?: string;
  };
  dark: {
    background: string;
    text: string;
    border?: string;
  };
}

/** 单个枚举项的展示配置 */
export interface EnumDisplayItem {
  /** 显示文本 */
  text: string;
  /** 主题颜色 */
  colors: ThemeColors;
  /** 图标 */
  icon?: ReactNode;
  /** 展示变体 */
  variant?: DisplayVariant;
}

/** 枚举展示配置映射 */
export type EnumDisplayConfig<T extends string | number> = Record<T, EnumDisplayItem>;

/** EnumDisplay 组件属性 */
export interface EnumDisplayProps<T extends string | number> {
  /** 枚举值 */
  value: T | null | undefined;
  /** 枚举配置 */
  config: EnumDisplayConfig<T>;
  /** 展示变体，默认 badge */
  variant?: DisplayVariant;
  /** 尺寸，默认 default */
  size?: DisplaySize;
  /** 是否显示图标，默认 true */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** StatusBadge 组件属性 */
export interface StatusBadgeProps {
  /** 枚举项配置 */
  item: EnumDisplayItem;
  /** 尺寸 */
  size?: DisplaySize;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/** RoleTagList 组件属性 */
export interface RoleTagListProps {
  /** 角色名称列表 */
  roles: string[];
  /** 最大显示数量，默认 3 */
  maxDisplay?: number;
  /** 自定义类名 */
  className?: string;
}
