/**
 * 通用枚举展示组件
 * 支持 tag、badge、dot、text 四种展示变体
 */
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import type { EnumDisplayProps, EnumDisplayItem, DisplaySize } from './types';
import { getDefaultConfig } from './configs';
import { StatusBadge } from './StatusBadge';

/** 尺寸样式映射 */
const sizeStyles: Record<DisplaySize, React.CSSProperties> = {
  small: { fontSize: '12px' },
  default: { fontSize: '13px' },
  large: { fontSize: '14px' },
};

/** dot 尺寸映射 */
const dotSizes: Record<DisplaySize, number> = {
  small: 6,
  default: 8,
  large: 10,
};

export function EnumDisplay<T extends string | number>({
  value,
  config,
  variant = 'badge',
  size = 'default',
  showIcon = true,
  className,
  style,
}: EnumDisplayProps<T>) {
  const { isDarkMode } = useTheme();

  // 处理空值
  if (value === null || value === undefined) {
    return <span className={className} style={{ color: '#8c8c8c', ...style }}>-</span>;
  }

  // 获取配置项，未定义则使用默认配置
  const item: EnumDisplayItem = config[value] || getDefaultConfig();
  const colors = isDarkMode ? item.colors.dark : item.colors.light;
  const displayVariant = item.variant || variant;

  // badge 变体 - 使用 StatusBadge 组件
  if (displayVariant === 'badge') {
    return (
      <StatusBadge
        item={item}
        size={size}
        showIcon={showIcon}
        className={className}
        style={style}
      />
    );
  }

  // tag 变体 - 类似 badge 但更紧凑
  if (displayVariant === 'tag') {
    const tagStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0 7px',
      borderRadius: '4px',
      backgroundColor: colors.background,
      color: colors.text,
      border: colors.border ? `1px solid ${colors.border}` : 'none',
      lineHeight: '22px',
      ...sizeStyles[size],
      ...style,
    };
    return (
      <span className={className} style={tagStyle}>
        {showIcon && item.icon}
        {item.text}
      </span>
    );
  }

  // dot 变体 - 圆点 + 文字
  if (displayVariant === 'dot') {
    const dotStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: isDarkMode ? '#d9d9d9' : '#595959',
      ...sizeStyles[size],
      ...style,
    };
    const dotSize = dotSizes[size];
    return (
      <span className={className} style={dotStyle}>
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: colors.text,
          }}
        />
        {item.text}
      </span>
    );
  }

  // text 变体 - 仅文字和图标，带颜色
  const textStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: colors.text,
    ...sizeStyles[size],
    ...style,
  };
  return (
    <span className={className} style={textStyle}>
      {showIcon && item.icon}
      {item.text}
    </span>
  );
}

export default EnumDisplay;
