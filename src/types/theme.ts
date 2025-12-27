/**
 * Universe Life Admin - 主题类型定义
 *
 * 基于宇宙概念的动态主题系统类型定义
 * 支持 Ant Design v5 Design Tokens 扩展
 *
 * @author James
 * @version 1.0.0
 */

/**
 * Universe 主题配置接口
 * 定义主题 token 和组件配置
 */
export interface UniverseTheme {
  /** Ant Design Design Tokens */
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
    fontFamily?: string;
    fontFamilyCode?: string;
    padding?: number;
    paddingLG?: number;
    paddingSM?: number;
    paddingXS?: number;
    boxShadow?: string;
    boxShadowSecondary?: string;
    motionDurationSlow?: string;
    motionDurationMid?: string;
    motionDurationFast?: string;
  };
  /** 组件级别的主题配置 */
  components?: {
    Button?: {
      controlHeight?: number;
      borderRadius?: number;
      fontWeight?: number;
      colorBgContainer?: string;
    };
    Input?: {
      controlHeight?: number;
      borderRadius?: number;
      paddingInline?: number;
      colorBgContainer?: string;
    };
    Card?: {
      borderRadius?: number;
      paddingLG?: number;
      colorBgContainer?: string;
    };
    Menu?: {
      borderRadius?: number;
      itemBorderRadius?: number;
    };
    Table?: {
      borderRadius?: number;
      headerBg?: string;
      colorBgContainer?: string;
    };
    Modal?: {
      borderRadius?: number;
    };
    Drawer?: {
      borderRadius?: number;
    };
  };
}

/**
 * 主题上下文接口
 */
export interface ThemeContextType {
  /** 是否为深色模式 */
  isDarkMode: boolean;
  /** 切换主题 */
  toggleTheme: () => void;
  /** 设置主题 */
  setTheme: (_dark: boolean) => void;
  /** 当前主题配置 */
  theme: UniverseTheme;
}

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark';

/**
 * CSS 变量名映射
 */
export interface CSSVariables {
  '--universe-primary': string;
  '--universe-success': string;
  '--universe-warning': string;
  '--universe-error': string;
  '--universe-info': string;
  '--universe-bg-layout': string;
  '--universe-bg-container': string;
  '--universe-bg-elevated': string;
  '--universe-text': string;
  '--universe-text-secondary': string;
  '--universe-text-tertiary': string;
  '--universe-border': string;
  '--universe-border-radius': string;
  '--universe-border-radius-lg': string;
  '--universe-border-radius-sm': string;
  '--universe-shadow': string;
  '--universe-shadow-secondary': string;
  '--universe-font-family': string;
  '--universe-font-family-code': string;
}

/**
 * 主题预设配置接口
 */
export interface ThemePreset {
  name: string;
  displayName: string;
  theme: UniverseTheme;
  icon?: string;
  description?: string;
}

/**
 * 主题存储接口
 */
export interface ThemeStorage {
  mode: ThemeMode;
  customTheme?: Partial<UniverseTheme>;
  preset?: string;
  lastUpdated: number;
}