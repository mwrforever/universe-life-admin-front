/**
 * Universe Life Admin - 简化布局组件
 *
 * 已被 CosmicNavigation 组件替代
 * 保留此文件作为备用组件
 *
 * @author James
 * @version 3.0.0
 */

import React from 'react';
import CosmicNavigation from './CosmicNavigation';

// 组件属性类型定义
interface ProBasicLayoutProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}

// 重构后的布局组件 - 使用新的宇宙导航
const ProBasicLayout: React.FC<ProBasicLayoutProps> = ({
  currentPage,
  onPageChange,
  children,
}) => {
  return (
    <CosmicNavigation
      currentPage={currentPage}
      onPageChange={onPageChange}
    >
      {children}
    </CosmicNavigation>
  );
};

export default ProBasicLayout;