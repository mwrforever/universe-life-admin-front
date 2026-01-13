/**
 * 性别展示组件
 * 封装性别枚举的展示逻辑
 */
import React from 'react';
import { EnumDisplay } from './EnumDisplay';
import { genderConfig } from './configs';
import type { DisplaySize } from './types';
import type { Gender } from '../../../services/system';

interface GenderDisplayProps {
  /** 性别值 */
  value: Gender | null | undefined;
  /** 尺寸 */
  size?: DisplaySize;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

export const GenderDisplay: React.FC<GenderDisplayProps> = ({
  value,
  size = 'default',
  showIcon = true,
  className,
  style,
}) => {
  return (
    <EnumDisplay
      value={value}
      config={genderConfig}
      variant="text"
      size={size}
      showIcon={showIcon}
      className={className}
      style={style}
    />
  );
};

export default GenderDisplay;
