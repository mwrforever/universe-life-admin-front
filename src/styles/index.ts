/**
 * 样式入口文件
 * 导入所有样式和主题配置
 */

import './globals.css'
import { WanXiangTheme } from './themes/wanxiang-theme'

// 导出主题配置供其他模块使用
export { WanXiangTheme }
export type { ThemeType } from './themes/wanxiang-theme'

// 导入 Ant Design 主题配置工具
import type { ThemeConfig } from 'antd'

// Ant Design 主题配置
export const antdThemeConfig: ThemeConfig = {
  token: {
    // 主色彩配置
    colorPrimary: WanXiangTheme.primary[500],
    colorSuccess: WanXiangTheme.status.success,
    colorWarning: WanXiangTheme.status.warning,
    colorError: WanXiangTheme.status.error,
    colorInfo: WanXiangTheme.status.info,

    // 圆角配置
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // 字体配置
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // 阴影配置
    boxShadow: WanXiangTheme.shadow.small,
    boxShadowSecondary: WanXiangTheme.shadow.medium,

    // 间距配置
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // 控制台自定义配置
    wireframe: false,
  },
  components: {
    // 按钮组件定制
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      boxShadow: 'none',
      boxShadowSecondary: WanXiangTheme.shadow.small,
    },

    // 输入框组件定制
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      activeBorderColor: WanXiangTheme.primary[500],
      hoverBorderColor: WanXiangTheme.primary[400],
    },

    // 卡片组件定制
    Card: {
      borderRadius: 12,
      boxShadow: WanXiangTheme.shadow.small,
      paddingLG: 24,
    },

    // 导航菜单定制
    Menu: {
      borderRadius: 8,
      itemBg: 'transparent',
      itemSelectedBg: WanXiangTheme.primary[50],
      itemSelectedColor: WanXiangTheme.primary[600],
      itemHoverBg: WanXiangTheme.primary[100],
    },

    // 表格组件定制
    Table: {
      borderRadius: 8,
      headerBg: WanXiangTheme.background.tertiary,
      headerColor: WanXiangTheme.text.primary,
    },

    // 表单组件定制
    Form: {
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },

    // 选择器组件定制
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      optionSelectedBg: WanXiangTheme.primary[50],
    },

    // 标签页定制
    Tabs: {
      itemActiveColor: WanXiangTheme.primary[600],
      itemSelectedColor: WanXiangTheme.primary[600],
      inkBarColor: WanXiangTheme.primary[500],
    },

    // 模态框定制
    Modal: {
      borderRadius: 12,
      paddingLG: 24,
    },

    // 消息提示定制
    Message: {
      borderRadius: 8,
    },

    // 通知定制
    Notification: {
      borderRadius: 8,
    },
  },
}