/**
 * 角色类型枚举配置
 */
import React from 'react';
import { SafetyOutlined, TeamOutlined, UserSwitchOutlined } from '@ant-design/icons';
import type { EnumDisplayConfig } from '../types';
import { errorColors, processingColors, successColors } from '../colorPresets';
import { RoleType } from '../../../../services/system';

/** 角色类型展示配置 */
export const roleTypeConfig: EnumDisplayConfig<RoleType> = {
  [RoleType.SYSTEM]: {
    text: '系统角色',
    icon: <SafetyOutlined />,
    colors: errorColors,
  },
  [RoleType.BUSINESS]: {
    text: '业务角色',
    icon: <TeamOutlined />,
    colors: processingColors,
  },
  [RoleType.CUSTOM]: {
    text: '自定义角色',
    icon: <UserSwitchOutlined />,
    colors: successColors,
  },
};
