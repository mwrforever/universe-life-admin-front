/**
 * 用户协议勾选组件
 */

import React from 'react';
import { AgreementCheckboxProps } from '../types/Login.types';
import { StyledCheckbox } from '../styles/Login.styles';
import { BUTTON_TEXTS } from '../utils/constants';
import { useTheme } from '@/contexts/ThemeContext';

const AgreementCheckbox: React.FC<AgreementCheckboxProps> = ({
  checked,
  onChange,
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <StyledCheckbox
      checked={checked}
      onChange={handleCheckboxChange}
      className={className}
      isDark={isDark}
    >
      {BUTTON_TEXTS.AGREEMENT}
      <a
        href="#"
        className="agreement-link"
        onClick={(e) => {
          e.preventDefault();
          openLink('/user-agreement');
        }}
      >
        {BUTTON_TEXTS.USER_AGREEMENT}
      </a>
      和
      <a
        href="#"
        className="agreement-link"
        onClick={(e) => {
          e.preventDefault();
          openLink('/privacy-policy');
        }}
      >
        {BUTTON_TEXTS.PRIVACY_POLICY}
      </a>
    </StyledCheckbox>
  );
};

AgreementCheckbox.displayName = 'AgreementCheckbox';

export default AgreementCheckbox;