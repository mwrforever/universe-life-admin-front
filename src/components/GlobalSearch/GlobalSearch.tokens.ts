/**
 * 全局搜索组件CSS变量tokens定义
 */

// 亮色模式tokens
export const lightTokens = {
  // 搜索框样式
  '--search-bg': '#ffffff',
  '--search-border': 'rgba(0,0,0,.08)',
  '--search-border-focus': 'var(--antd-colorPrimary)',
  '--search-radius': '8px',
  '--search-height': '40px',
  '--search-placeholder': 'rgba(0,0,0,.45)',
  '--search-text': 'rgba(0,0,0,.88)',

  // 下拉框样式
  '--dropdown-shadow': '0 6px 24px rgba(0,0,0,.08)',
  '--dropdown-radius': '12px',
  '--dropdown-bg': 'rgba(255,255,255,.92)',
  '--dropdown-backdrop': 'blur(20px)',
  '--dropdown-border': 'rgba(0,0,0,.06)',

  // 建议项样式
  '--item-height': '72px',
  '--item-radius': '8px',
  '--item-hover': 'rgba(0,0,0,.03)',
  '--item-active': 'var(--antd-colorPrimaryBgHover)',
  '--item-active-border': 'var(--antd-colorPrimary)',
  '--item-padding-vertical': '12px',
  '--item-padding-horizontal': '16px',

  // 文字颜色
  '--title-color': 'rgba(0,0,0,.88)',
  '--desc-color': 'rgba(0,0,0,.56)',
  '--history-title-color': 'rgba(0,0,0,.45)',
  '--clear-button-color': 'rgba(0,0,0,.45)',
  '--highlight-color': 'var(--antd-colorPrimary)',

  // 布局尺寸
  '--max-width': '680px',
  '--min-width': '320px',
  '--dropdown-max-height': '360px',
  '--dropdown-offset': '4px',
  '--z-index': '1050',

  // 动画时间
  '--animation-duration-enter': '0.3s',
  '--animation-duration-exit': '0.15s',
  '--animation-easing-enter': 'ease-out',
  '--animation-easing-exit': 'ease-in',

  // 滚动条样式
  '--scrollbar-width': '6px',
  '--scrollbar-bg': 'transparent',
  '--scrollbar-thumb': 'rgba(0,0,0,.26)',
  '--scrollbar-thumb-hover': 'rgba(0,0,0,.4)',

  // 响应式
  '--mobile-height': '48px',
  '--mobile-font-size': '16px',
  '--mobile-dropdown-offset': '0px',
  '--mobile-border-radius': '0px',
} as const

// 暗黑模式tokens
export const darkTokens = {
  // 搜索框样式
  '--search-bg': '#1f1f1f',
  '--search-border': 'rgba(255,255,255,.08)',
  '--search-border-focus': 'var(--antd-colorPrimary)',
  '--search-radius': '8px',
  '--search-height': '40px',
  '--search-placeholder': 'rgba(255,255,255,.45)',
  '--search-text': 'rgba(255,255,255,.92)',

  // 下拉框样式
  '--dropdown-shadow': '0 6px 24px rgba(0,0,0,.48)',
  '--dropdown-radius': '12px',
  '--dropdown-bg': 'rgba(31,31,31,.92)',
  '--dropdown-backdrop': 'blur(20px)',
  '--dropdown-border': 'rgba(255,255,255,.08)',

  // 建议项样式
  '--item-height': '72px',
  '--item-radius': '8px',
  '--item-hover': 'rgba(255,255,255,.06)',
  '--item-active': 'var(--antd-colorPrimaryBgHover)',
  '--item-active-border': 'var(--antd-colorPrimary)',
  '--item-padding-vertical': '12px',
  '--item-padding-horizontal': '16px',

  // 文字颜色
  '--title-color': 'rgba(255,255,255,.92)',
  '--desc-color': 'rgba(255,255,255,.56)',
  '--history-title-color': 'rgba(255,255,255,.45)',
  '--clear-button-color': 'rgba(255,255,255,.45)',
  '--highlight-color': 'var(--antd-colorPrimary)',

  // 布局尺寸
  '--max-width': '680px',
  '--min-width': '320px',
  '--dropdown-max-height': '360px',
  '--dropdown-offset': '4px',
  '--z-index': '1050',

  // 动画时间
  '--animation-duration-enter': '0.3s',
  '--animation-duration-exit': '0.15s',
  '--animation-easing-enter': 'ease-out',
  '--animation-easing-exit': 'ease-in',

  // 滚动条样式
  '--scrollbar-width': '6px',
  '--scrollbar-bg': 'transparent',
  '--scrollbar-thumb': 'rgba(255,255,255,.26)',
  '--scrollbar-thumb-hover': 'rgba(255,255,255,.4)',

  // 响应式
  '--mobile-height': '48px',
  '--mobile-font-size': '16px',
  '--mobile-dropdown-offset': '0px',
  '--mobile-border-radius': '0px',
} as const

// 响应式断点tokens
export const responsiveTokens = {
  '--breakpoint-mobile': '375px',
  '--breakpoint-tablet': '768px',
  '--breakpoint-desktop': '1200px',
} as const

// 获取当前主题tokens
export const getThemeTokens = (isDark: boolean = false) => {
  const baseTokens = isDark ? darkTokens : lightTokens
  return {
    ...baseTokens,
    ...responsiveTokens,
  }
}

// 生成CSS变量字符串
export const generateCSSVariables = (tokens: Record<string, string>) => {
  return Object.entries(tokens)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ')
}

// 媒体查询辅助函数
export const mediaQueries = {
  mobile: '@media (max-width: 376px)',
  tablet: '@media (max-width: 768px)',
  desktop: '@media (min-width: 769px)',
} as const

// 动画关键帧
export const animations = {
  dropdownEnter: {
    initial: { opacity: 0, transform: 'translateY(-8px)' },
    animate: { opacity: 1, transform: 'translateY(0)' },
    exit: { opacity: 0, transform: 'translateY(-8px)' },
  },
  itemHover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  itemActive: {
    scale: 1,
    transition: { duration: 0.1 },
  },
} as const