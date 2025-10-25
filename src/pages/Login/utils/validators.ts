/**
 * 验证工具函数
 */

import { VALIDATION_RULES } from './constants';
import { ValidationRule, ValidationState } from '../types/Login.types';

// 验证单个字段的函数
export const validateField = (
  value: string,
  rules: ValidationRule,
  isTouched: boolean = false
): ValidationState => {
  // 如果字段没有被触碰过，返回默认状态
  if (!isTouched && !value) {
    return {
      isValid: true,
      isTouched: false,
    };
  }

  // 检查必填
  if (rules.required && !value.trim()) {
    return {
      isValid: false,
      error: rules.message || '此字段为必填项',
      isTouched: true,
    };
  }

  // 如果没有值且不是必填，直接返回有效
  if (!value.trim()) {
    return {
      isValid: true,
      isTouched: true,
    };
  }

  // 检查最小长度
  if (rules.minLength && value.length < rules.minLength) {
    return {
      isValid: false,
      error: rules.message || `最少需要${rules.minLength}个字符`,
      isTouched: true,
    };
  }

  // 检查最大长度
  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      isValid: false,
      error: rules.message || `最多允许${rules.maxLength}个字符`,
      isTouched: true,
    };
  }

  // 检查正则表达式
  if (rules.pattern && !rules.pattern.test(value)) {
    return {
      isValid: false,
      error: rules.message || '格式不正确',
      isTouched: true,
    };
  }

  return {
    isValid: true,
    isTouched: true,
  };
};

// 验证手机号
export const validatePhone = (phone: string, isTouched: boolean = false): ValidationState => {
  return validateField(phone, VALIDATION_RULES.phone, isTouched);
};

// 验证邮箱
export const validateEmail = (email: string, isTouched: boolean = false): ValidationState => {
  return validateField(email, VALIDATION_RULES.email, isTouched);
};

// 验证用户名
export const validateUsername = (username: string, isTouched: boolean = false): ValidationState => {
  return validateField(username, VALIDATION_RULES.username, isTouched);
};

// 验证密码
export const validatePassword = (password: string, isTouched: boolean = false): ValidationState => {
  return validateField(password, VALIDATION_RULES.password, isTouched);
};

// 验证验证码
export const validateCode = (code: string, isTouched: boolean = false): ValidationState => {
  return validateField(code, VALIDATION_RULES.code, isTouched);
};

// 智能验证身份标识符（手机号/邮箱/账号）
export const validateIdentifier = (
  identifier: string,
  isTouched: boolean = false
): ValidationState => {
  if (!isTouched && !identifier.trim()) {
    return {
      isValid: true,
      isTouched: false,
    };
  }

  if (!identifier.trim()) {
    return {
      isValid: false,
      error: '请输入手机号/邮箱/账号',
      isTouched: true,
    };
  }

  // 依次尝试手机号、邮箱、用户名验证
  const phoneResult = validatePhone(identifier, true);
  if (phoneResult.isValid) {
    return phoneResult;
  }

  const emailResult = validateEmail(identifier, true);
  if (emailResult.isValid) {
    return emailResult;
  }

  const usernameResult = validateUsername(identifier, true);
  if (usernameResult.isValid) {
    return usernameResult;
  }

  // 如果都不匹配，返回通用错误
  return {
    isValid: false,
    error: '请输入正确的手机号/邮箱/账号',
    isTouched: true,
  };
};

// 格式化手机号（添加空格分隔）
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');

  // 如果是11位手机号，格式化为 3 4 4
  if (cleaned.length === 11 && /^1[3-9]\d{9}$/.test(cleaned)) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  }

  return phone;
};

// 清理手机号格式（移除空格）
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/\s/g, '');
};

// 检查密码强度
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  level: 'weak' | 'medium' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('密码至少需要8位字符');
  }

  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含大写字母');
  }

  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含小写字母');
  }

  // 包含数字
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含数字');
  }

  // 包含特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('建议包含特殊字符');
  }

  // 计算强度等级
  let level: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    level = 'weak';
  } else if (score <= 4) {
    level = 'medium';
  } else {
    level = 'strong';
  }

  return {
    score,
    feedback,
    level,
  };
};

// 生成验证码输入的ref数组
export const generateCodeInputRefs = (length: number = 6) => {
  return Array.from({ length }, () => React.createRef<HTMLInputElement>());
};

// 处理验证码输入
export const handleCodeInput = (
  value: string,
  index: number,
  inputs: React.RefObject<HTMLInputElement>[],
  onCodeChange: (code: string) => void,
  currentCode: string
) => {
  // 只允许数字
  const numValue = value.replace(/\D/g, '');

  if (numValue.length > 1) {
    // 如果粘贴了多个字符，分配到各个输入框
    const chars = numValue.split('');
    chars.forEach((char, i) => {
      if (index + i < inputs.length) {
        inputs[index + i].current!.value = char;
      }
    });

    const newCode = currentCode.split('');
    chars.forEach((char, i) => {
      newCode[index + i] = char;
    });
    onCodeChange(newCode.join('').slice(0, inputs.length));

    // 聚焦到最后一个有值的输入框的下一个
    const lastIndex = Math.min(index + chars.length - 1, inputs.length - 1);
    if (lastIndex < inputs.length - 1) {
      inputs[lastIndex + 1].current?.focus();
    }
  } else if (numValue) {
    inputs[index].current!.value = numValue;
    const newCode = currentCode.split('');
    newCode[index] = numValue;
    onCodeChange(newCode.join(''));

    // 自动聚焦下一个输入框
    if (index < inputs.length - 1) {
      inputs[index + 1].current?.focus();
    }
  } else {
    // 清空当前输入框
    inputs[index].current!.value = '';
    const newCode = currentCode.split('');
    newCode[index] = '';
    onCodeChange(newCode.join(''));
  }
};

// 处理验证码删除键
export const handleCodeKeyDown = (
  e: React.KeyboardEvent,
  index: number,
  inputs: React.RefObject<HTMLInputElement>[],
  currentCode: string,
  onCodeChange: (code: string) => void
) => {
  if (e.key === 'Backspace' && !currentCode[index] && index > 0) {
    // 如果当前输入框为空且按下删除键，聚焦到上一个输入框
    inputs[index - 1].current?.focus();
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' && index > 0) {
    // 左箭头键聚焦到上一个输入框
    inputs[index - 1].current?.focus();
    e.preventDefault();
  } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
    // 右箭头键聚焦到下一个输入框
    inputs[index + 1].current?.focus();
    e.preventDefault();
  }
};

// 验证整个表单
export const validateLoginForm = (
  formData: any,
  method: 'password' | 'otp'
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // 验证身份标识符
  const identifierResult = validateIdentifier(formData.credentials.identifier, true);
  if (!identifierResult.isValid) {
    errors.identifier = identifierResult.error!;
  }

  // 根据登录方式验证不同字段
  if (method === 'password') {
    const passwordResult = validatePassword(formData.credentials.password, true);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error!;
    }
  } else {
    const codeResult = validateCode(formData.credentials.code, true);
    if (!codeResult.isValid) {
      errors.code = codeResult.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};