/**
 * 性别枚举配置
 */
import React from 'react';
import { ManOutlined, WomanOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { EnumDisplayConfig } from '../types';
import { processingColors, pinkColors, defaultColors } from '../colorPresets';
import { Gender } from '../../../../services/system';

/** 性别展示配置 */
export const genderConfig: EnumDisplayConfig<Gender> = {
  [Gender.SECRET]: {
    text: '保密',
    icon: <QuestionCircleOutlined />,
    variant: 'text',
    colors: defaultColors,
  },
  [Gender.MALE]: {
    text: '男',
    icon: <ManOutlined />,
    variant: 'text',
    colors: processingColors,
  },
  [Gender.FEMALE]: {
    text: '女',
    icon: <WomanOutlined />,
    variant: 'text',
    colors: pinkColors,
  },
};
