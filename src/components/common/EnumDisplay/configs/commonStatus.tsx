/**
 * 通用状态枚举配置（启用/禁用）
 */
import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { EnumDisplayConfig } from '../types';
import { successColors, defaultColors } from '../colorPresets';
import { CommonStatus } from '../../../../services/system';

/** 通用状态展示配置 */
export const commonStatusConfig: EnumDisplayConfig<CommonStatus> = {
  [CommonStatus.ENABLED]: {
    text: '启用',
    icon: <CheckCircleOutlined />,
    colors: successColors,
  },
  [CommonStatus.DISABLED]: {
    text: '禁用',
    icon: <CloseCircleOutlined />,
    colors: defaultColors,
  },
};
