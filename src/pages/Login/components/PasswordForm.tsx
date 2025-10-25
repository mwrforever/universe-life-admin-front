/**
 * 密码登录表单组件
 */

import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { PasswordFormProps } from '../types/Login.types';
import {
  StyledForm,
  StyledInput,
  StyledPasswordInput,
  StyledButton
} from '../styles/Login.styles';
import { PLACEHOLDERS, BUTTON_TEXTS } from '../utils/constants';
import { useTheme } from '@/contexts/ThemeContext';

const PasswordForm: React.FC<PasswordFormProps> = ({
  formData,
  onChange,
  onSubmit,
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const [passwordVisible, setPasswordVisible] = useState(false);

  // 处理输入变化
  const handleInputChange = useCallback((field: string, value: string) => {
    onChange({
      ...formData,
      credentials: {
        ...formData.credentials,
        [field]: value
      }
    });
  }, [formData, onChange]);

  // 处理表单提交
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    onSubmit();
  }, [onSubmit]);

  // 切换密码可见性
  const togglePasswordVisible = useCallback(() => {
    setPasswordVisible(!passwordVisible);
  }, [passwordVisible]);

  // 检查表单是否可以提交
  const canSubmit = formData.credentials.identifier.trim() &&
                   formData.credentials.password.trim() &&
                   formData.agreementAccepted &&
                   !formData.isSubmitting;

  return (
    <StyledForm
      layout="vertical"
      onFinish={handleSubmit}
      className={className}
      isDark={isDark}
    >
      {/* 身份标识符输入框 */}
      <Form.Item
        validateStatus={
          formData.validation.identifier.isTouched && !formData.validation.identifier.isValid
            ? 'error'
            : undefined
        }
        help={
          formData.validation.identifier.isTouched && !formData.validation.identifier.isValid
            ? formData.validation.identifier.error
            : undefined
        }
      >
        <StyledInput
          prefix={<UserOutlined />}
          placeholder={PLACEHOLDERS.IDENTIFIER}
          value={formData.credentials.identifier}
          onChange={(e) => handleInputChange('identifier', e.target.value)}
          size="large"
          isDark={isDark}
        />
      </Form.Item>

      {/* 密码输入框 */}
      <Form.Item
        validateStatus={
          formData.validation.password.isTouched && !formData.validation.password.isValid
            ? 'error'
            : undefined
        }
        help={
          formData.validation.password.isTouched && !formData.validation.password.isValid
            ? formData.validation.password.error
            : undefined
        }
      >
        <StyledPasswordInput
          prefix={<LockOutlined />}
          placeholder={PLACEHOLDERS.PASSWORD}
          value={formData.credentials.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          size="large"
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: togglePasswordVisible,
          }}
          iconRender={(visible) => (
            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
          )}
          isDark={isDark}
        />
      </Form.Item>

      {/* 忘记密码链接 */}
      <div style={{ textAlign: 'right', marginBottom: '16px' }}>
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => {
            // TODO: 实现忘记密码功能
            console.log('忘记密码');
          }}
        >
          {BUTTON_TEXTS.FORGOT_PASSWORD}
        </Button>
      </div>

      {/* 登录按钮 */}
      <Form.Item style={{ marginBottom: '16px' }}>
        <StyledButton
          type="primary"
          htmlType="submit"
          loading={formData.isSubmitting}
          disabled={!canSubmit}
          block
          size="large"
          isDark={isDark}
        >
          {formData.isSubmitting ? '登录中...' : BUTTON_TEXTS.LOGIN}
        </StyledButton>
      </Form.Item>

      {/* 注册链接 */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Space split={<Divider type="vertical" />}>
          <span style={{ color: 'var(--login-text-secondary)' }}>
            还没有账号？
          </span>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => {
              // TODO: 跳转到注册页面
              console.log('注册账号');
            }}
          >
            {BUTTON_TEXTS.REGISTER}
          </Button>
        </Space>
      </div>
    </StyledForm>
  );
};

PasswordForm.displayName = 'PasswordForm';

export default PasswordForm;