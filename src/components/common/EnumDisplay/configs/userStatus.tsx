/**
 * 用户状态枚举配置
 */
import React from 'react';
import {
  CheckCircleOutlined,
  SyncOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { EnumDisplayConfig } from '../types';
import { successColors, processingColors, warningColors, defaultColors } from '../colorPresets';
import { UserStatus } from '../../../../services/system';

/** 用户状态展示配置 */
export const userStatusConfig: EnumDisplayConfig<UserStatus> = {
  [UserStatus.NORMAL]: {
    text: '正常',
    icon: <CheckCircleOutlined />,
    colors: successColors,
  },
  [UserStatus.CAN_RECEIVE]: {
    text: '可接单',
    icon: <SyncOutlined />,
    colors: processingColors,
  },
  [UserStatus.CAN_PUBLISH]: {
    text: '可发单',
    icon: <SendOutlined />,
    colors: warningColors,
  },
  [UserStatus.DISABLE]: {
    text: '禁用',
    icon: <StopOutlined />,
    colors: defaultColors,
  },
};
