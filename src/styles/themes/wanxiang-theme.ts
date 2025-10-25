/**
 * 万象生活主题色彩配置
 * 生活气息、温暖专业的色彩方案
 */

export const WanXiangTheme = {
  // 主色系 - 柔和渐变蓝
  primary: {
    50: '#f0f2ff',
    100: '#e0e5ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // 主色
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  // 辅助色系 - 温暖生活色
  warm: {
    orange: '#ff9a76',
    pink: '#ffc3c0',
    yellow: '#fff4db',
    green: '#d1fae5',
    purple: '#e9d5ff',
  },

  // 中性色 - 温和灰
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // 文本色
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    white: '#ffffff',
    inverse: '#ffffff',
  },

  // 背景色
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    glass: 'rgba(255, 255, 255, 0.8)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // 功能色
  status: {
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    processing: '#1890ff',
  },

  // 阴影
  shadow: {
    small: '0 2px 8px rgba(0, 0, 0, 0.06)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
    large: '0 8px 24px rgba(0, 0, 0, 0.12)',
    glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
  },

  // 圆角
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    full: '50%',
  },

  // 间距
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
}

// CSS 变量映射
export const cssVariables = {
  '--wan-primary-50': WanXiangTheme.primary[50],
  '--wan-primary-100': WanXiangTheme.primary[100],
  '--wan-primary-200': WanXiangTheme.primary[200],
  '--wan-primary-300': WanXiangTheme.primary[300],
  '--wan-primary-400': WanXiangTheme.primary[400],
  '--wan-primary-500': WanXiangTheme.primary[500],
  '--wan-primary-600': WanXiangTheme.primary[600],
  '--wan-primary-700': WanXiangTheme.primary[700],
  '--wan-primary-800': WanXiangTheme.primary[800],
  '--wan-primary-900': WanXiangTheme.primary[900],
  '--wan-primary-gradient': WanXiangTheme.primary.gradient,

  '--wan-warm-orange': WanXiangTheme.warm.orange,
  '--wan-warm-pink': WanXiangTheme.warm.pink,
  '--wan-warm-yellow': WanXiangTheme.warm.yellow,
  '--wan-warm-green': WanXiangTheme.warm.green,
  '--wan-warm-purple': WanXiangTheme.warm.purple,

  '--wan-text-primary': WanXiangTheme.text.primary,
  '--wan-text-secondary': WanXiangTheme.text.secondary,
  '--wan-text-tertiary': WanXiangTheme.text.tertiary,
  '--wan-text-white': WanXiangTheme.text.white,

  '--wan-bg-primary': WanXiangTheme.background.primary,
  '--wan-bg-secondary': WanXiangTheme.background.secondary,
  '--wan-bg-tertiary': WanXiangTheme.background.tertiary,
  '--wan-bg-glass': WanXiangTheme.background.glass,

  '--wan-shadow-small': WanXiangTheme.shadow.small,
  '--wan-shadow-medium': WanXiangTheme.shadow.medium,
  '--wan-shadow-large': WanXiangTheme.shadow.large,
  '--wan-shadow-glass': WanXiangTheme.shadow.glass,

  '--wan-radius-small': WanXiangTheme.borderRadius.small,
  '--wan-radius-medium': WanXiangTheme.borderRadius.medium,
  '--wan-radius-large': WanXiangTheme.borderRadius.large,
  '--wan-radius-xl': WanXiangTheme.borderRadius.xl,
}

export type ThemeType = typeof WanXiangTheme