/**
 * 枚举配置入口
 */
import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { EnumDisplayItem } from '../types';
import { defaultColors } from '../colorPresets';

// 导出所有配置
export { userStatusConfig } from './userStatus';
export { commonStatusConfig } from './commonStatus';
export { genderConfig } from './gender';
export { roleTypeConfig } from './roleType';
export { resourceTypeConfig } from './resourceType';

/**
 * 获取默认配置（用于未定义的枚举值）
 */
export const getDefaultConfig = (): EnumDisplayItem => ({
  text: '未知',
  icon: React.createElement(QuestionCircleOutlined),
  colors: defaultColors,
});
