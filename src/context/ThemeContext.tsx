/**
 * Universe Life Admin - 主题与配置中心
 *
 * 基于宇宙概念的动态主题管理系统
 * 支持深色/浅色模式无缝切换，采用 Ant Design v5 Design Tokens
 *
 * @author James
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';

// 主题模式枚举
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

// 内联类型定义以避免模块解析问题
interface UniverseTheme {
  token: {
    colorPrimary?: string;
    colorSuccess?: string;
    colorWarning?: string;
    colorError?: string;
    colorInfo?: string;
    colorBgBase?: string;
    colorBgContainer?: string;
    colorBgElevated?: string;
    colorBgLayout?: string;
    colorText?: string;
    colorTextSecondary?: string;
    colorTextTertiary?: string;
    colorTextQuaternary?: string;
    colorBorder?: string;
    colorBorderSecondary?: string;
    borderRadius?: number;
    borderRadiusLG?: number;
    borderRadiusSM?: number;
    controlHeight?: number;
    controlHeightLG?: number;
    controlHeightSM?: number;
    padding?: number;
    paddingLG?: number;
    paddingSM?: number;
    paddingXS?: number;
    fontFamily?: string;
    fontFamilyCode?: string;
    boxShadow?: string;
    boxShadowSecondary?: string;
    motionDurationSlow?: string;
    motionDurationMid?: string;
    motionDurationFast?: string;
  };
  components?: Record<string, unknown>;
}

interface ChartColors {
  gridColor: string;
  axisColor: string;
  legendTextColor: string;
  tooltipBackground: string;
  tooltipTextColor: string;
  areaChartGradient: string[];
  pieColors: string[];
  lineColor: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: string;
  toggleTheme: () => void;
  setTheme: (_dark: boolean) => void;
  theme: UniverseTheme;
  chartColors: ChartColors;
}

// Universe Blue - 品牌主色调，在深色背景下依然明亮清晰
const UNIVERSE_BLUE = '#5B50FF';

// 默认主题配置
const defaultLightTheme: UniverseTheme = {
  token: {
    // 主色调系统
    colorPrimary: UNIVERSE_BLUE,
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',

    // 圆角与质感 - 现代精细感
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // 控件高度 - 提升触感
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,

    // 字体系统 - 选择具有科技感的字体组合
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyCode: '"Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

    // 间距系统
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // 阴影系统 - 精致的阴影效果
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 1px 2px rgba(0, 0, 0, 0.03)',

    // 动画系统 - 流畅的过渡效果
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 6,
      fontWeight: 500,
    } as Record<string, unknown>,
    Input: {
      controlHeight: 40,
      borderRadius: 6,
      paddingInline: 16,
    } as Record<string, unknown>,
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    } as Record<string, unknown>,
    Menu: {
      borderRadius: 6,
      itemBorderRadius: 4,
    } as Record<string, unknown>,
    Table: {
      borderRadius: 6,
      headerBg: 'rgba(91, 80, 255, 0.02)',
    } as Record<string, unknown>,
    Modal: {
      borderRadius: 12,
    } as Record<string, unknown>,
    Drawer: {
      borderRadius: 0,
    } as Record<string, unknown>,
  },
};

// 深色主题配置
const _darkTheme: UniverseTheme = {
  ...defaultLightTheme,
  token: {
    ...defaultLightTheme.token,
    // 深色模式下的主色调保持明亮
    colorPrimary: UNIVERSE_BLUE,

    // 深色背景系统
    colorBgBase: '#0a0a0a',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',

    // 深色文本系统
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',

    // 深色边框系统
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',

    // 深色阴影系统 - 使用更深的阴影
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  components: {
    ...(defaultLightTheme.components || {}),
    Button: {
      ...(defaultLightTheme.components?.Button as Record<string, unknown> || {}),
      colorBgContainer: '#1f1f1f',
    } as Record<string, unknown>,
    Input: {
      ...(defaultLightTheme.components?.Input as Record<string, unknown> || {}),
      colorBgContainer: '#1f1f1f',
    } as Record<string, unknown>,
    Card: {
      ...(defaultLightTheme.components?.Card as Record<string, unknown> || {}),
      colorBgContainer: '#141414',
    } as Record<string, unknown>,
    Table: {
      ...(defaultLightTheme.components?.Table as Record<string, unknown> || {}),
      headerBg: 'rgba(91, 80, 255, 0.08)',
      colorBgContainer: '#141414',
    } as Record<string, unknown>,
  },
};

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider 组件
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从 localStorage 读取保存的主题设置
  const getInitialTheme = (): boolean => {
    const savedTheme = localStorage.getItem('universe-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }

    // 检测系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }

    return false; // 默认浅色模式
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 初始化主题设置
  useEffect(() => {
    setIsInitialized(true);

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('universe-theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('universe-theme', newTheme ? 'dark' : 'light');
  };

  // 设置主题
  const setTheme = (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('universe-theme', dark ? 'dark' : 'light');
  };

  // 获取图表专用颜色配置
  const getChartColors = (): ChartColors => {
    if (isDarkMode) {
      return {
        gridColor: 'rgba(255, 255, 255, 0.08)',
        axisColor: 'rgba(255, 255, 255, 0.45)',
        legendTextColor: 'rgba(255, 255, 255, 0.65)',
        tooltipBackground: 'rgba(0, 0, 0, 0.85)',
        tooltipTextColor: 'rgba(255, 255, 255, 0.88)',
        areaChartGradient: ['#5B50FF', '#7C7AFF', '#9CA7FF'],
        pieColors: ['#5B50FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
        lineColor: '#5B50FF',
      };
    } else {
      return {
        gridColor: 'rgba(0, 0, 0, 0.08)',
        axisColor: 'rgba(0, 0, 0, 0.45)',
        legendTextColor: 'rgba(0, 0, 0, 0.65)',
        tooltipBackground: 'rgba(255, 255, 255, 0.95)',
        tooltipTextColor: 'rgba(0, 0, 0, 0.88)',
        areaChartGradient: ['#5B50FF', '#8B85FF', '#B5B2FF'],
        pieColors: ['#5B50FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
        lineColor: '#5B50FF',
      };
    }
  };

  // 获取当前主题配置
  const getCurrentTheme = (): UniverseTheme => {
    return isDarkMode ? _darkTheme : defaultLightTheme;
  };

  // 生成 CSS 变量
  const generateCSSVariables = (theme: UniverseTheme) => {
    const root = document.documentElement;

    // 设置基础 Design Tokens
    root.style.setProperty('--universe-primary', theme.token.colorPrimary!);
    root.style.setProperty('--universe-success', theme.token.colorSuccess!);
    root.style.setProperty('--universe-warning', theme.token.colorWarning!);
    root.style.setProperty('--universe-error', theme.token.colorError!);
    root.style.setProperty('--universe-info', theme.token.colorInfo!);

    // 设置背景色
    root.style.setProperty('--universe-bg-layout', isDarkMode ? '#000000' : '#ffffff');
    root.style.setProperty('--universe-bg-container', isDarkMode ? '#141414' : '#ffffff');
    root.style.setProperty('--universe-bg-elevated', isDarkMode ? '#1f1f1f' : '#ffffff');

    // 设置文本色
    root.style.setProperty('--universe-text', isDarkMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.88)');
    root.style.setProperty('--universe-text-secondary', isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)');
    root.style.setProperty('--universe-text-tertiary', isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)');

    // 设置边框色
    root.style.setProperty('--universe-border', isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');

    // 设置圆角
    root.style.setProperty('--universe-border-radius', `${theme.token.borderRadius}px`);
    root.style.setProperty('--universe-border-radius-lg', `${theme.token.borderRadiusLG}px`);
    root.style.setProperty('--universe-border-radius-sm', `${theme.token.borderRadiusSM}px`);

    // 设置阴影
    root.style.setProperty('--universe-shadow', theme.token.boxShadow!);
    root.style.setProperty('--universe-shadow-secondary', theme.token.boxShadowSecondary!);

    // 设置字体
    root.style.setProperty('--universe-font-family', theme.token.fontFamily!);
    root.style.setProperty('--universe-font-family-code', theme.token.fontFamilyCode!);
  };

  // 应用 CSS 变量
  useEffect(() => {
    if (isInitialized) {
      const currentTheme = getCurrentTheme();
      generateCSSVariables(currentTheme);

      // 设置 body 的 data-theme 属性
      document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

      // 设置 body 背景色
      document.body.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';

      // 设置过渡效果
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
  }, [isDarkMode, isInitialized]);

  const value: ThemeContextType = {
    isDarkMode,
    themeMode: isDarkMode ? 'dark' : 'light',
    toggleTheme,
    setTheme,
    theme: getCurrentTheme(),
    chartColors: getChartColors(),
  };

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          ...getCurrentTheme(),
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 使用主题的 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 导出主题配置
export { UNIVERSE_BLUE, defaultLightTheme, _darkTheme as darkTheme };