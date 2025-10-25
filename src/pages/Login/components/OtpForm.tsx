/**
 * 验证码登录表单组件
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Form, Input, Button, Space } from 'antd';
import { UserOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { OtpFormProps } from '../types/Login.types';
import {
  StyledForm,
  StyledInput,
  StyledButton,
  CodeInputGroup
} from '../styles/Login.styles';
import { PLACEHOLDERS, BUTTON_TEXTS } from '../utils/constants';
import { formatPhoneNumber, cleanPhoneNumber, handleCodeInput, handleCodeKeyDown } from '../utils/validators';
import { useTheme } from '@/contexts/ThemeContext';

const OtpForm: React.FC<OtpFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onSendCode,
  countdown,
  className
}) => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';
  const [codeInputs, setCodeInputs] = useState<string[]>(Array(6).fill(''));
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  // 处理身份标识符输入
  const handleIdentifierChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatPhoneNumber(value);
    onChange({
      ...formData,
      credentials: {
        ...formData.credentials,
        identifier: formattedValue
      }
    });
  }, [formData, onChange]);

  // 处理验证码输入
  const handleCodeInputChange = useCallback((index: number, value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    handleCodeInput(
      cleanedValue,
      index,
      codeInputRefs.current as React.RefObject<HTMLInputElement>[],
      (newCode) => {
        const updatedCode = newCode.padEnd(6, '0');
        setCodeInputs(updatedCode.split(''));
        onChange({
          ...formData,
          credentials: {
            ...formData.credentials,
            code: updatedCode
          }
        });
      },
      formData.credentials.code
    );
  }, [formData, onChange]);

  // 处理验证码键盘事件
  const handleCodeKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    handleCodeKeyDown(
      e,
      index,
      codeInputRefs.current as React.RefObject<HTMLInputElement>[],
      formData.credentials.code,
      (newCode) => {
        onChange({
          ...formData,
          credentials: {
            ...formData.credentials,
            code: newCode
          }
        });
      }
    );
  }, [formData, onChange]);

  // 处理发送验证码
  const handleSendCode = useCallback(() => {
    if (!formData.credentials.identifier.trim()) {
      return;
    }

    const cleanedIdentifier = cleanPhoneNumber(formData.credentials.identifier);
    onSendCode();
  }, [formData, onSendCode]);

  // 处理表单提交
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    onSubmit();
  }, [onSubmit]);

  // 自动聚焦第一个验证码输入框
  useEffect(() => {
    if (codeInputRefs.current[0]) {
      codeInputRefs.current[0].focus();
    }
  }, []);

  // 检查表单是否可以提交
  const canSubmit = formData.credentials.identifier.trim() &&
                   formData.credentials.code.trim().length === 6 &&
                   formData.agreementAccepted &&
                   !formData.isSubmitting;

  // 检查是否可以发送验证码
  const canSendCode = formData.credentials.identifier.trim() &&
                     countdown === 0 &&
                     !formData.isSubmitting;

  // 处理粘贴验证码
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);

    if (numbers.length > 0) {
      const newCode = numbers.padEnd(6, '0');
      const chars = newCode.split('');

      chars.forEach((char, index) => {
        if (codeInputRefs.current[index]) {
          codeInputRefs.current[index]!.value = char;
        }
      });

      setCodeInputs(chars);
      onChange({
        ...formData,
        credentials: {
          ...formData.credentials,
          code: newCode
        }
      });

      // 聚焦到最后一个有值的输入框的下一个
      const lastIndex = Math.min(numbers.length - 1, 5);
      if (lastIndex < 5 && codeInputRefs.current[lastIndex + 1]) {
        codeInputRefs.current[lastIndex + 1]?.focus();
      }
    }
  }, [formData, onChange]);

  return (
    <StyledForm
      layout="vertical"
      onFinish={handleSubmit}
      className={className}
      isDark={isDark}
    >
      {/* 手机号/邮箱输入框 */}
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
          onChange={handleIdentifierChange}
          size="large"
          isDark={isDark}
        />
      </Form.Item>

      {/* 验证码发送按钮 */}
      <Form.Item style={{ marginBottom: '8px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <StyledInput
            placeholder="请输入验证码"
            disabled
            size="large"
            style={{ flex: 1 }}
            isDark={isDark}
          />
          <StyledButton
            type="default"
            onClick={handleSendCode}
            disabled={!canSendCode}
            loading={formData.isSubmitting}
            size="large"
            isDark={isDark}
          >
            {countdown > 0 ? `${countdown}s` : BUTTON_TEXTS.SEND_CODE}
          </StyledButton>
        </Space.Compact>
      </Form.Item>

      {/* 验证码输入框组 */}
      <Form.Item
        validateStatus={
          formData.validation.code.isTouched && !formData.validation.code.isValid
            ? 'error'
            : undefined
        }
        help={
          formData.validation.code.isTouched && !formData.validation.code.isValid
            ? formData.validation.code.error
            : undefined
        }
      >
        <CodeInputGroup isDark={isDark}>
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              ref={(el) => {
                codeInputRefs.current[index] = el;
              }}
              className="code-input"
              value={value}
              onChange={(e) => handleCodeInputChange(index, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              maxLength={1}
              size="large"
              style={{ textAlign: 'center', padding: 0 }}
              isDark={isDark}
            />
          ))}
        </CodeInputGroup>
      </Form.Item>

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

      {/* 提示信息 */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--login-text-secondary)' }}>
        <SafetyOutlined style={{ marginRight: '4px' }} />
        验证码有效期为5分钟，请及时输入
      </div>
    </StyledForm>
  );
};

OtpForm.displayName = 'OtpForm';

export default OtpForm;