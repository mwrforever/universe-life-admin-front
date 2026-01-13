/**
 * Axios 类型扩展
 * 添加自定义配置选项
 */

import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 是否禁用自动错误提示
     * 设置为 true 时，请求失败不会自动显示错误提示
     * @default false
     */
    skipErrorNotification?: boolean;
  }
}
