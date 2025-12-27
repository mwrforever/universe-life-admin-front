/**
 * Universe Life Logo - 万象生活轮廓图标
 * 
 * 宇宙主题的轮廓SVG图标，不使用填充色
 * 
 * @author James
 * @version 1.0.0
 */

import React from 'react';

interface UniverseLifeLogoProps {
  size?: number;
  isDark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const UniverseLifeLogo: React.FC<UniverseLifeLogoProps> = ({
  size = 36,
  isDark = false,
  className,
  style,
}) => {
  // 根据主题选择描边颜色
  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(102, 126, 234, 0.9)';
  const accentColor = isDark ? 'rgba(167, 139, 250, 0.9)' : 'rgba(118, 75, 162, 0.85)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* 外圈 - 宇宙边界 */}
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* 内圈 - 行星轨道 */}
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="8"
        stroke={accentColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        transform="rotate(-25 24 24)"
      />
      
      {/* 第二轨道 */}
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="8"
        stroke={accentColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        transform="rotate(25 24 24)"
      />
      
      {/* 中心星球 */}
      <circle
        cx="24"
        cy="24"
        r="5"
        stroke={strokeColor}
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* 星星点缀 - 左上 */}
      <path
        d="M11 11 L12 13 L11 15 L10 13 Z"
        stroke={accentColor}
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 星星点缀 - 右上 */}
      <path
        d="M37 13 L38 15 L37 17 L36 15 Z"
        stroke={accentColor}
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 星星点缀 - 左下 */}
      <path
        d="M10 35 L11 37 L10 39 L9 37 Z"
        stroke={accentColor}
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 星星点缀 - 右下 */}
      <path
        d="M38 33 L39 35 L38 37 L37 35 Z"
        stroke={accentColor}
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* 轨道上的小行星 */}
      <circle
        cx="34"
        cy="17"
        r="2"
        stroke={strokeColor}
        strokeWidth="1.2"
        fill="none"
      />
      
      <circle
        cx="14"
        cy="31"
        r="1.5"
        stroke={accentColor}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
};

export default UniverseLifeLogo;
