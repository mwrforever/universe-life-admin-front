/**
 * 资源类型枚举配置
 */
import React from 'react';
import { MenuOutlined, AppstoreOutlined, ApiOutlined, DatabaseOutlined } from '@ant-design/icons';
import type { EnumDisplayConfig } from '../types';
import { processingColors, successColors, warningColors, purpleColors } from '../colorPresets';
import { ResourceType } from '../../../../services/system';

/** 资源类型展示配置 */
export const resourceTypeConfig: EnumDisplayConfig<ResourceType> = {
  [ResourceType.MENU]: {
    text: '菜单',
    icon: <MenuOutlined />,
    colors: processingColors,
  },
  [ResourceType.BUTTON]: {
    text: '按钮',
    icon: <AppstoreOutlined />,
    colors: successColors,
  },
  [ResourceType.API]: {
    text: 'API',
    icon: <ApiOutlined />,
    colors: warningColors,
  },
  [ResourceType.DATA_PERMISSION]: {
    text: '数据权限',
    icon: <DatabaseOutlined />,
    colors: purpleColors,
  },
};
