/**
 * 登录页面设计系统tokens
 */

// 亮色主题tokens
export const lightTokens = {
  // 背景色
  '--login-bg': '#FFFDFB',
  '--login-card-bg': '#FFFFFF',

  // 主色调
  '--login-primary': '#FF6B00',
  '--login-primary-hover': '#E55A00',
  '--login-primary-active': '#CC4F00',

  // 文字颜色
  '--login-text-primary': 'rgba(0,0,0,.88)',
  '--login-text-secondary': 'rgba(0,0,0,.56)',
  '--login-text-disabled': 'rgba(0,0,0,.25)',
  '--login-text-error': '#FF4D4F',
  '--login-text-success': '#52C41A',

  // 边框颜色
  '--login-border': '#D9D9D9',
  '--login-border-hover': '#4096FF',
  '--login-border-error': '#FF4D4F',
  '--login-border-focus': '#4096FF',

  // 圆角
  '--login-radius-small': '6px',
  '--login-radius-medium': '8px',
  '--login-radius-large': '12px',

  // 阴影
  '--login-shadow-card': '0 8px 32px rgba(0,0,0,.08)',
  '--login-shadow-input': '0 0 0 2px rgba(24, 144, 255, 0.2)',
  '--login-shadow-hover': '0 4px 12px rgba(0,0,0,.08)',

  // 间距
  '--login-spacing-xs': '4px',
  '--login-spacing-sm': '8px',
  '--login-spacing-md': '16px',
  '--login-spacing-lg': '24px',
  '--login-spacing-xl': '32px',
  '--login-spacing-xxl': '48px',

  // 字体大小
  '--login-font-size-xs': '12px',
  '--login-font-size-sm': '14px',
  '--login-font-size-md': '16px',
  '--login-font-size-lg': '18px',
  '--login-font-size-xl': '20px',
  '--login-font-size-xxl': '24px',

  // 过渡动画
  '--login-transition-fast': '0.15s ease',
  '--login-transition-normal': '0.3s ease',
  '--login-transition-slow': '0.5s ease',

  // z-index层级
  '--login-z-dropdown': 1000,
  '--login-z-modal': 1050,
  '--login-z-tooltip': 1070,
} as const;

// 暗黑主题tokens
export const darkTokens = {
  // 背景色
  '--login-bg': '#141414',
  '--login-card-bg': '#1F1F1F',

  // 主色调
  '--login-primary': '#FF6B00',
  '--login-primary-hover': '#FF8A33',
  '--login-primary-active': '#E55A00',

  // 文字颜色
  '--login-text-primary': 'rgba(255,255,255,.88)',
  '--login-text-secondary': 'rgba(255,255,255,.56)',
  '--login-text-disabled': 'rgba(255,255,255,.25)',
  '--login-text-error': '#FF7875',
  '--login-text-success': '#73D13D',

  // 边框颜色
  '--login-border': '#434343',
  '--login-border-hover': '#69B1FF',
  '--login-border-error': '#FF7875',
  '--login-border-focus': '#69B1FF',

  // 圆角
  '--login-radius-small': '6px',
  '--login-radius-medium': '8px',
  '--login-radius-large': '12px',

  // 阴影
  '--login-shadow-card': '0 8px 32px rgba(0,0,0,.4)',
  '--login-shadow-input': '0 0 0 2px rgba(24, 144, 255, 0.25)',
  '--login-shadow-hover': '0 4px 12px rgba(0,0,0,.4)',

  // 间距
  '--login-spacing-xs': '4px',
  '--login-spacing-sm': '8px',
  '--login-spacing-md': '16px',
  '--login-spacing-lg': '24px',
  '--login-spacing-xl': '32px',
  '--login-spacing-xxl': '48px',

  // 字体大小
  '--login-font-size-xs': '12px',
  '--login-font-size-sm': '14px',
  '--login-font-size-md': '16px',
  '--login-font-size-lg': '18px',
  '--login-font-size-xl': '20px',
  '--login-font-size-xxl': '24px',

  // 过渡动画
  '--login-transition-fast': '0.15s ease',
  '--login-transition-normal': '0.3s ease',
  '--login-transition-slow': '0.5s ease',

  // z-index层级
  '--login-z-dropdown': 1000,
  '--login-z-modal': 1050,
  '--login-z-tooltip': 1070,
} as const;

// 响应式媒体查询
export const mediaQueries = {
  mobile: `@media (max-width: 767px)`,
  tablet: `@media (min-width: 768px) and (max-width: 1199px)`,
  desktop: `@media (min-width: 1200px)`,
} as const;

// 获取当前主题tokens的函数
export const getThemeTokens = (isDark: boolean) => {
  return isDark ? darkTokens : lightTokens;
};

// 应用tokens到DOM的函数
export const applyThemeTokens = (isDark: boolean) => {
  const tokens = getThemeTokens(isDark);
  const root = document.documentElement;

  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};