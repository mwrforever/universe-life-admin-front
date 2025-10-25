/**
 * Brand区域组件 - 显示LOGO和欢迎语
 */

import React from 'react';
import { BrandSectionProps } from '../types/Login.types';
import {
  LogoContainer,
  WelcomeText
} from '../styles/Login.styles';
import { useTheme } from '@/contexts/ThemeContext';

const BrandSection: React.FC<BrandSectionProps> = ({
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <BrandSection className={className} isDark={isDark}>
      <LogoContainer isDark={isDark}>
        <span className="logo-icon">🎯</span>
      </LogoContainer>
      <WelcomeText isDark={isDark}>
        <h1 className="title">欢迎回来</h1>
        <p className="subtitle">
          登录万象生活管理系统，开启智能管理之旅
        </p>
      </WelcomeText>
    </BrandSection>
  );
};

BrandSection.displayName = 'BrandSection';

export default BrandSection;