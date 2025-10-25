/**
 * 登录卡片容器组件
 */

import React, { ReactNode } from 'react';
import { LoginCardProps } from '../types/Login.types';
import { LoginCard as StyledLoginCard } from '../styles/Login.styles';
import { useTheme } from '@/contexts/ThemeContext';

const LoginCard: React.FC<LoginCardProps> = ({
  children,
  className,
  onSuccess,
  onError
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <StyledLoginCard
      className={className}
      isDark={isDark}
    >
      {children}
    </StyledLoginCard>
  );
};

LoginCard.displayName = 'LoginCard';

export default LoginCard;