/**
 * 预定义颜色主题
 * 提供常用的状态颜色配置，支持深色/浅色主题
 */
import type { ThemeColors } from './types';

/** 成功/正常状态 - 绿色系 */
export const successColors: ThemeColors = {
  light: { background: '#f6ffed', text: '#52c41a', border: '#b7eb8f' },
  dark: { background: '#162312', text: '#95de64', border: '#274916' },
};

/** 处理中/进行中状态 - 蓝色系 */
export const processingColors: ThemeColors = {
  light: { background: '#e6f4ff', text: '#1677ff', border: '#91caff' },
  dark: { background: '#111a2c', text: '#69b1ff', border: '#15325b' },
};

/** 警告/待处理状态 - 橙色系 */
export const warningColors: ThemeColors = {
  light: { background: '#fff7e6', text: '#fa8c16', border: '#ffd591' },
  dark: { background: '#2b1d11', text: '#ffc069', border: '#593815' },
};

/** 错误/危险状态 - 红色系 */
export const errorColors: ThemeColors = {
  light: { background: '#fff2f0', text: '#ff4d4f', border: '#ffccc7' },
  dark: { background: '#2a1215', text: '#ff7875', border: '#58181c' },
};

/** 默认/禁用状态 - 灰色系 */
export const defaultColors: ThemeColors = {
  light: { background: '#f5f5f5', text: '#8c8c8c', border: '#d9d9d9' },
  dark: { background: '#1f1f1f', text: '#8c8c8c', border: '#434343' },
};

/** 信息状态 - 青色系 */
export const infoColors: ThemeColors = {
  light: { background: '#e6fffb', text: '#13c2c2', border: '#87e8de' },
  dark: { background: '#112123', text: '#5cdbd3', border: '#144848' },
};

/** 紫色系 - 用于特殊标记 */
export const purpleColors: ThemeColors = {
  light: { background: '#f9f0ff', text: '#722ed1', border: '#d3adf7' },
  dark: { background: '#1a1325', text: '#b37feb', border: '#301c4d' },
};

/** 粉色系 - 用于女性等标记 */
export const pinkColors: ThemeColors = {
  light: { background: '#fff0f6', text: '#eb2f96', border: '#ffadd2' },
  dark: { background: '#291321', text: '#ff85c0', border: '#551c3b' },
};

/** 颜色预设集合 */
export const colorPresets = {
  success: successColors,
  processing: processingColors,
  warning: warningColors,
  error: errorColors,
  default: defaultColors,
  info: infoColors,
  purple: purpleColors,
  pink: pinkColors,
} as const;

export type ColorPresetKey = keyof typeof colorPresets;
