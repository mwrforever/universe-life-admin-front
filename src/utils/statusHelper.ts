/**
 * 状态辅助工具函数
 */

export type UserStatus = 'online' | 'offline' | 'frozen';

/**
 * 获取状态对应的颜色
 */
export const getStatusColor = (status: UserStatus): string => {
  const colorMap: Record<UserStatus, string> = {
    online: '#52c41a',    // 绿色 - 在线
    offline: '#d9d9d9',   // 灰色 - 离线
    frozen: '#ff4d4f',    // 红色 - 冻结
  };

  return colorMap[status] || '#d9d9d9';
};

/**
 * 获取状态文本
 */
export const getStatusText = (status: UserStatus): string => {
  const textMap: Record<UserStatus, string> = {
    online: '在线',
    offline: '离线',
    frozen: '冻结',
  };

  return textMap[status] || '未知';
};

/**
 * 获取状态图标类型
 */
export const getStatusIcon = (status: UserStatus): string => {
  const iconMap: Record<UserStatus, string> = {
    online: 'check-circle',
    offline: 'close-circle',
    frozen: 'stop',
  };

  return iconMap[status] || 'question-circle';
};