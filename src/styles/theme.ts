/**
 * 万象生活后台管理系统 - 主题配置
 */

import { theme } from 'antd'

// 主题类型定义
export type ThemeMode = 'light' | 'dark'

// 设计令牌
export const designTokens = {
  // 主色配置
  colorPrimary: '#6366F1',
  colorSuccess: '#10B981',
  colorWarning: '#F59E0B',
  colorError: '#EF4444',

  // 布局配置
  borderRadius: 8,
  boxShadow: '1px 4px 12px rgba(0,0,0,.08)',

  // 侧边栏配置
  siderCollapsedWidth: 64,
  siderWidth: 200,

  // 响应式断点
  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1600px',
  }
}

// 浅色主题配置
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: designTokens.colorPrimary,
    colorSuccess: designTokens.colorSuccess,
    colorWarning: designTokens.colorWarning,
    colorError: designTokens.colorError,
    borderRadius: designTokens.borderRadius,
    boxShadow: designTokens.boxShadow,

    // 控件高度
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,

    // 字体大小
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // 卡片配置
    cardPadding: 24,
    cardRadius: designTokens.borderRadius,

    // 动画
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
  },
  components: {
    Layout: {
      siderBg: '#f5f7fa',
      triggerBg: '#e6f4ff',
      headerBg: '#FFFFFF',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f4ff',
      itemSelectedColor: '#096dd9',
      itemHoverBg: '#d6e4ff',
      itemColor: '#595959',
      darkItemColor: '#595959',
      darkItemSelectedColor: '#096dd9',
    },
    Button: {
      wave: { disabled: false },
    },
    Card: {
      borderRadius: designTokens.borderRadius,
      boxShadow: 'none',
    },
    Table: {
      borderRadius: designTokens.borderRadius,
    },
  },
}

// 深色主题配置
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: designTokens.colorPrimary,
    colorSuccess: designTokens.colorSuccess,
    colorWarning: designTokens.colorWarning,
    colorError: designTokens.colorError,
    borderRadius: designTokens.borderRadius,
    boxShadow: designTokens.boxShadow,

    // 深色模式特有配置
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',

    // 控件高度
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,

    // 字体大小
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // 间距
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // 动画
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
  },
  components: {
    Layout: {
      siderBg: '#141414',
      triggerBg: '#1f1f1f',
      headerBg: '#1f1f1f',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#1f1f1f',
      itemSelectedColor: '#69b1ff',
      itemHoverBg: '#262626',
      itemColor: '#bfbfbf',
      darkItemColor: '#bfbfbf',
      darkItemSelectedColor: '#69b1ff',
      darkItemHoverBg: '#262626',
    },
    Button: {
      wave: { disabled: false },
    },
    Card: {
      borderRadius: designTokens.borderRadius,
      backgroundColor: '#1f1f1f',
    },
    Table: {
      borderRadius: designTokens.borderRadius,
      headerBg: '#262626',
    },
  },
}

// 获取当前主题配置
export const getThemeConfig = (isDark: boolean = false) => {
  return isDark ? darkTheme : lightTheme
}