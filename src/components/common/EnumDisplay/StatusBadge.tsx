/**
 * 状态徽章组件
 * 带图标、颜色和圆角的美观徽章设计
 */
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import type { StatusBadgeProps, DisplaySize } from './types';

/** 尺寸样式映射 */
const sizeStyles: Record<DisplaySize, React.CSSProperties> = {
  small: { padding: '1px 6px', fontSize: '12px', gap: '3px' },
  default: { padding: '2px 8px', fontSize: '13px', gap: '4px' },
  large: { padding: '4px 12px', fontSize: '14px', gap: '6px' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  item,
  size = 'default',
  showIcon = true,
  className,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? item.colors.dark : item.colors.light;

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '4px',
    fontWeight: 500,
    lineHeight: 1.5,
    backgroundColor: colors.background,
    color: colors.text,
    border: colors.border ? `1px solid ${colors.border}` : 'none',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...style,
  };

  return (
    <span className={className} style={badgeStyle}>
      {showIcon && item.icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {item.icon}
        </span>
      )}
      <span>{item.text}</span>
    </span>
  );
};

export default StatusBadge;
