/**
 * 登录Tab切换组件
 */

import React from 'react';
import { LoginTabsProps } from '../types/Login.types';
import { StyledTabs } from '../styles/Login.styles';
import { useTheme } from '@/contexts/ThemeContext';

const LoginTabs: React.FC<LoginTabsProps> = ({
  activeTab,
  onChange,
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  // Tab项配置
  const tabItems = [
    {
      key: 'otp',
      label: '验证码登录',
    },
    {
      key: 'password',
      label: '密码登录',
    },
  ];

  return (
    <StyledTabs
      activeKey={activeTab}
      onChange={onChange}
      centered
      size="large"
      className={className}
      isDark={isDark}
      items={tabItems}
    />
  );
};

LoginTabs.displayName = 'LoginTabs';

export default LoginTabs;