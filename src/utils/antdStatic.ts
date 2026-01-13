/**
 * antd 静态方法工具
 * 用于在 React 组件外部（如 axios 拦截器）使用 antd 的 message、notification 等
 *
 * antd v5 中，直接从 'antd' 导入的 message 在组件外部不会显示
 * 需要通过 App.useApp() 获取的实例才能正常工作
 *
 * @author Universe Life
 * @version 1.0.0
 */

import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';

// 全局静态方法实例
let messageInstance: MessageInstance | null = null;
let notificationInstance: NotificationInstance | null = null;
let modalInstance: Omit<ModalStaticFunctions, 'warn'> | null = null;

/**
 * 设置全局静态方法实例
 * 在 App 组件中调用，传入 App.useApp() 返回的实例
 */
export function setAntdStaticInstances(
  message: MessageInstance,
  notification: NotificationInstance,
  modal: Omit<ModalStaticFunctions, 'warn'>
): void {
  messageInstance = message;
  notificationInstance = notification;
  modalInstance = modal;
}

/**
 * 获取全局 message 实例
 */
export function getMessageInstance(): MessageInstance | null {
  return messageInstance;
}

/**
 * 获取全局 notification 实例
 */
export function getNotificationInstance(): NotificationInstance | null {
  return notificationInstance;
}

/**
 * 获取全局 modal 实例
 */
export function getModalInstance(): Omit<ModalStaticFunctions, 'warn'> | null {
  return modalInstance;
}

/**
 * 显示错误消息
 * 如果全局实例未初始化，使用 console.error 作为降级方案
 */
export function showErrorMessage(content: string, duration?: number): void {
  if (messageInstance) {
    messageInstance.error(content, duration);
  } else {
    console.error('[antd message not ready]', content);
  }
}

/**
 * 显示成功消息
 */
export function showSuccessMessage(content: string, duration?: number): void {
  if (messageInstance) {
    messageInstance.success(content, duration);
  } else {
    console.log('[antd message not ready]', content);
  }
}

/**
 * 显示警告消息
 */
export function showWarningMessage(content: string, duration?: number): void {
  if (messageInstance) {
    messageInstance.warning(content, duration);
  } else {
    console.warn('[antd message not ready]', content);
  }
}

/**
 * 显示信息消息
 */
export function showInfoMessage(content: string, duration?: number): void {
  if (messageInstance) {
    messageInstance.info(content, duration);
  } else {
    console.info('[antd message not ready]', content);
  }
}
