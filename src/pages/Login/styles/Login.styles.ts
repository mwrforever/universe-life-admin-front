/**
 * 登录页面样式组件
 */

import styled from '@emotion/styled';
import { Card, Form, Button, Input, Checkbox, Tabs } from 'antd';
import { getThemeTokens, mediaQueries } from './tokens';

// 获取主题tokens的工具函数
const getTokens = (isDark: boolean = false) => getThemeTokens(isDark);

// 登录页面容器
export const LoginContainer = styled.div<{ isDark?: boolean }>`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--login-bg);
  padding: var(--login-spacing-md);
  position: relative;
  overflow: hidden;

  /* 背景装饰 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--login-primary) 0%, transparent 70%);
    opacity: 0.1;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, var(--login-primary) 0%, transparent 70%);
    opacity: 0.08;
    border-radius: 50%;
  }

  ${mediaQueries.mobile} {
    padding: var(--login-spacing-sm);
    justify-content: flex-start;
    padding-top: var(--login-spacing-xl);
  }
`;

// 登录卡片
export const LoginCard = styled(Card)<{ isDark?: boolean }>`
  width: 400px;
  border-radius: var(--login-radius-large);
  box-shadow: var(--login-shadow-card);
  border: none;
  background: var(--login-card-bg);
  overflow: hidden;
  position: relative;
  z-index: 1;

  /* 卡片动画 */
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  ${mediaQueries.tablet} {
    width: 360px;
  }

  ${mediaQueries.mobile} {
    width: 100%;
    max-width: calc(100vw - 32px);
    margin: 0;
    border-radius: var(--login-radius-large) var(--login-radius-large) 0 0;
    animation: slideUpMobile 0.4s ease-out;
  }

  @keyframes slideUpMobile {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Ant Design Card 覆盖样式 */
  .ant-card-body {
    padding: var(--login-spacing-xl);
    background: transparent;
  }

  ${mediaQueries.mobile} {
    .ant-card-body {
      padding: var(--login-spacing-lg);
    }
  }
`;

// Brand区域容器
export const BrandSection = styled.div<{ isDark?: boolean }>`
  text-align: center;
  margin-bottom: var(--login-spacing-xl);

  ${mediaQueries.mobile} {
    margin-bottom: var(--login-spacing-lg);
  }
`;

// Logo容器
export const LogoContainer = styled.div<{ isDark?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--login-spacing-md);

  .logo-icon {
    font-size: 48px;
    margin-right: var(--login-spacing-sm);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  ${mediaQueries.mobile} {
    .logo-icon {
      font-size: 40px;
    }
  }
`;

// 欢迎文字
export const WelcomeText = styled.div<{ isDark?: boolean }>`
  .title {
    font-size: var(--login-font-size-xxl);
    font-weight: 600;
    color: var(--login-text-primary);
    margin-bottom: var(--login-spacing-xs);
    line-height: 1.2;
  }

  .subtitle {
    font-size: var(--login-font-size-md);
    color: var(--login-text-secondary);
    line-height: 1.4;
  }

  ${mediaQueries.mobile} {
    .title {
      font-size: var(--login-font-size-xl);
    }

    .subtitle {
      font-size: var(--login-font-size-sm);
    }
  }
`;

// Tab组件样式覆盖
export const StyledTabs = styled(Tabs)<{ isDark?: boolean }>`
  margin-bottom: var(--login-spacing-lg);

  .ant-tabs-nav {
    margin-bottom: var(--login-spacing-lg);

    &::before {
      border-bottom: 1px solid var(--login-border);
    }
  }

  .ant-tabs-tab {
    flex: 1;
    justify-content: center;
    font-size: var(--login-font-size-md);
    font-weight: 500;
    color: var(--login-text-secondary);
    padding: var(--login-spacing-md) 0;
    margin: 0;
    transition: all var(--login-transition-fast);

    &:hover {
      color: var(--login-primary);
    }

    &.ant-tabs-tab-active {
      color: var(--login-primary);
      font-weight: 600;
    }
  }

  .ant-tabs-ink-bar {
    background: var(--login-primary);
    height: 3px;
    border-radius: var(--login-radius-small);
    transition: all var(--login-transition-normal);
  }

  .ant-tabs-content-holder {
    padding-top: var(--login-spacing-md);
  }

  .ant-tabs-tabpane {
    outline: none;
  }
`;

// 表单样式
export const StyledForm = styled(Form)<{ isDark?: boolean }>`
  .ant-form-item {
    margin-bottom: var(--login-spacing-lg);
  }

  .ant-form-item-label {
    padding-bottom: var(--login-spacing-sm);

    label {
      font-size: var(--login-font-size-sm);
      font-weight: 500;
      color: var(--login-text-primary);
    }
  }

  .ant-form-item-explain-error {
    font-size: var(--login-font-size-xs);
    margin-top: var(--login-spacing-xs);
    animation: shake 0.3s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

// 输入框样式
export const StyledInput = styled(Input)<{ isDark?: boolean }>`
  height: 48px;
  border-radius: var(--login-radius-medium);
  border: 1px solid var(--login-border);
  background: var(--login-card-bg);
  transition: all var(--login-transition-fast);
  font-size: var(--login-font-size-md);

  &:hover {
    border-color: var(--login-border-hover);
    box-shadow: var(--login-shadow-hover);
    transform: translateY(-1px);
  }

  &:focus,
  &.ant-input-focused {
    border-color: var(--login-border-focus);
    box-shadow: var(--login-shadow-input);
    transform: scale(1.02);
  }

  &.ant-input-status-error {
    border-color: var(--login-border-error);
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
  }

  .ant-input {
    background: transparent;
    color: var(--login-text-primary);
    font-size: var(--login-font-size-md);

    &::placeholder {
      color: var(--login-text-disabled);
    }
  }

  .ant-input-prefix {
    color: var(--login-text-secondary);
    margin-right: var(--login-spacing-sm);
  }

  .ant-input-suffix {
    color: var(--login-text-secondary);
    margin-left: var(--login-spacing-sm);
  }
`;

// 密码输入框
export const StyledPasswordInput = styled(Input.Password)<{ isDark?: boolean }>`
  height: 48px;
  border-radius: var(--login-radius-medium);
  border: 1px solid var(--login-border);
  background: var(--login-card-bg);
  transition: all var(--login-transition-fast);
  font-size: var(--login-font-size-md);

  &:hover {
    border-color: var(--login-border-hover);
    box-shadow: var(--login-shadow-hover);
    transform: translateY(-1px);
  }

  &:focus,
  &.ant-input-focused {
    border-color: var(--login-border-focus);
    box-shadow: var(--login-shadow-input);
    transform: scale(1.02);
  }

  &.ant-input-status-error {
    border-color: var(--login-border-error);
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
  }

  .ant-input {
    background: transparent;
    color: var(--login-text-primary);
    font-size: var(--login-font-size-md);

    &::placeholder {
      color: var(--login-text-disabled);
    }
  }

  .ant-input-password {
    background: transparent;
    border: none;
    box-shadow: none;

    input {
      background: transparent;
      color: var(--login-text-primary);
    }
  }

  .ant-input-prefix {
    color: var(--login-text-secondary);
    margin-right: var(--login-spacing-sm);
  }
`;

// 主按钮样式
export const StyledButton = styled(Button)<{ isDark?: boolean }>`
  height: 48px;
  border-radius: var(--login-radius-medium);
  font-size: var(--login-font-size-md);
  font-weight: 500;
  transition: all var(--login-transition-fast);
  border: none;
  box-shadow: 0 2px 8px rgba(255, 107, 0, 0.3);

  &:not(.ant-btn-link):not(.ant-btn-text) {
    background: var(--login-primary);
    border-color: var(--login-primary);
    color: #ffffff;

    &:hover {
      background: var(--login-primary-hover);
      border-color: var(--login-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(255, 107, 0, 0.4);
    }

    &:active {
      background: var(--login-primary-active);
      border-color: var(--login-primary-active);
      transform: translateY(0);
    }

    &.ant-btn-loading {
      opacity: 0.8;
    }
  }

  &.ant-btn-link {
    color: var(--login-primary);
    padding: 0;
    height: auto;

    &:hover {
      color: var(--login-primary-hover);
    }
  }

  &.ant-btn-text {
    color: var(--login-text-secondary);
    height: auto;
    padding: var(--login-spacing-xs) 0;

    &:hover {
      color: var(--login-primary);
      background: transparent;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

// 协议勾选框
export const StyledCheckbox = styled(Checkbox)<{ isDark?: boolean }>`
  .ant-checkbox {
    .ant-checkbox-inner {
      border-radius: var(--login-radius-small);
      border-color: var(--login-border);
      background: var(--login-card-bg);
      transition: all var(--login-transition-fast);
    }

    &.ant-checkbox-checked .ant-checkbox-inner {
      background-color: var(--login-primary);
      border-color: var(--login-primary);
    }

    &:hover .ant-checkbox-inner {
      border-color: var(--login-primary);
    }
  }

  .ant-checkbox + span {
    color: var(--login-text-secondary);
    font-size: var(--login-font-size-xs);
    line-height: 1.4;
    margin-left: var(--login-spacing-xs);
  }

  .agreement-link {
    color: var(--login-primary);
    text-decoration: none;
    margin: 0 var(--login-spacing-xs);
    transition: color var(--login-transition-fast);

    &:hover {
      color: var(--login-primary-hover);
      text-decoration: underline;
    }
  }
`;

// 第三方登录容器
export const ThirdPartyContainer = styled.div<{ isDark?: boolean }>`
  margin-top: var(--login-spacing-xl);
  border-top: 1px solid var(--login-border);
  padding-top: var(--login-spacing-lg);
  text-align: center;

  .divider {
    position: relative;
    text-align: center;
    margin-bottom: var(--login-spacing-lg);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--login-border);
    }

    span {
      background: var(--login-card-bg);
      padding: 0 var(--login-spacing-md);
      color: var(--login-text-secondary);
      font-size: var(--login-font-size-xs);
      position: relative;
      z-index: 1;
    }
  }

  .oauth-buttons {
    display: flex;
    gap: var(--login-spacing-sm);
    justify-content: center;
    flex-wrap: wrap;

    ${mediaQueries.mobile} {
      grid-template-columns: 1fr 1fr;
      gap: var(--login-spacing-md);
    }
  }

  .oauth-button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 var(--login-spacing-md);
    border-radius: var(--login-radius-medium);
    border: 1px solid var(--login-border);
    background: var(--login-card-bg);
    color: var(--login-text-secondary);
    font-size: var(--login-font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--login-transition-fast);
    text-decoration: none;
    min-width: 100px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--login-shadow-hover);
      border-color: var(--login-border-hover);
    }

    .icon {
      font-size: 18px;
      margin-right: var(--login-spacing-xs);
    }

    ${mediaQueries.mobile} {
      height: 48px;
      font-size: var(--login-font-size-sm);
      min-width: auto;
    }
  }
`;

// 验证码输入组
export const CodeInputGroup = styled.div<{ isDark?: boolean }>`
  display: flex;
  gap: var(--login-spacing-sm);
  justify-content: space-between;
  margin-bottom: var(--login-spacing-lg);

  .code-input {
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: var(--login-font-size-lg);
    font-weight: 600;
    border-radius: var(--login-radius-medium);
    border: 2px solid var(--login-border);
    background: var(--login-card-bg);
    color: var(--login-text-primary);
    transition: all var(--login-transition-fast);

    &:focus {
      border-color: var(--login-border-focus);
      box-shadow: var(--login-shadow-input);
      outline: none;
      transform: scale(1.05);
    }

    &:hover {
      border-color: var(--login-border-hover);
    }

    &.filled {
      border-color: var(--login-primary);
      background: rgba(255, 107, 0, 0.05);
    }

    ${mediaQueries.mobile} {
      width: 45px;
      height: 45px;
      font-size: var(--login-font-size-md);
    }
  }
`;