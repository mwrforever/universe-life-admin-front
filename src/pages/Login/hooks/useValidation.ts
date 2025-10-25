/**
 * 表单验证hook
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ValidationState } from '../types/Login.types';
import {
  validateIdentifier,
  validatePassword,
  validateCode,
} from '../utils/validators';

interface UseValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseValidationReturn {
  identifier: ValidationState;
  password: ValidationState;
  code: ValidationState;
  validateField: (field: string, value: string) => ValidationState;
  touchField: (field: string) => void;
  resetValidation: () => void;
  isFormValid: (method: 'password' | 'otp') => boolean;
  getFormErrors: (method: 'password' | 'otp') => Record<string, string>;
}

export const useValidation = (options: UseValidationOptions = {}): UseValidationReturn => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  // 表单字段验证状态
  const [identifier, setIdentifier] = useState<ValidationState>({
    isValid: true,
    isTouched: false,
  });

  const [password, setPassword] = useState<ValidationState>({
    isValid: true,
    isTouched: false,
  });

  const [code, setCode] = useState<ValidationState>({
    isValid: true,
    isTouched: false,
  });

  // 验证单个字段
  const validateField = useCallback((field: string, value: string): ValidationState => {
    let result: ValidationState = {
      isValid: true,
      isTouched: true,
    };

    switch (field) {
      case 'identifier':
        result = validateIdentifier(value, true);
        setIdentifier(result);
        break;
      case 'password':
        result = validatePassword(value, true);
        setPassword(result);
        break;
      case 'code':
        result = validateCode(value, true);
        setCode(result);
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }

    return result;
  }, []);

  // 标记字段为已触碰（用于显示验证错误）
  const touchField = useCallback((field: string) => {
    switch (field) {
      case 'identifier':
        setIdentifier(prev => ({ ...prev, isTouched: true }));
        break;
      case 'password':
        setPassword(prev => ({ ...prev, isTouched: true }));
        break;
      case 'code':
        setCode(prev => ({ ...prev, isTouched: true }));
        break;
      default:
        console.warn(`Unknown field: ${field}`);
    }
  }, []);

  // 重置所有验证状态
  const resetValidation = useCallback(() => {
    setIdentifier({
      isValid: true,
      isTouched: false,
    });
    setPassword({
      isValid: true,
      isTouched: false,
    });
    setCode({
      isValid: true,
      isTouched: false,
    });
  }, []);

  // 检查整个表单是否有效
  const isFormValid = useCallback((method: 'password' | 'otp'): boolean => {
    if (method === 'password') {
      return identifier.isValid && password.isValid;
    } else {
      return identifier.isValid && code.isValid;
    }
  }, [identifier.isValid, password.isValid, code.isValid]);

  // 获取表单错误信息
  const getFormErrors = useCallback((method: 'password' | 'otp'): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!identifier.isValid && identifier.isTouched && identifier.error) {
      errors.identifier = identifier.error;
    }

    if (method === 'password') {
      if (!password.isValid && password.isTouched && password.error) {
        errors.password = password.error;
      }
    } else {
      if (!code.isValid && code.isTouched && code.error) {
        errors.code = code.error;
      }
    }

    return errors;
  }, [identifier, password, code]);

  return {
    identifier,
    password,
    code,
    validateField,
    touchField,
    resetValidation,
    isFormValid,
    getFormErrors,
  };
};

// 实时验证hook
export const useRealTimeValidation = (
  value: string,
  validator: (value: string, isTouched?: boolean) => ValidationState,
  options: {
    debounce?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  } = {}
) => {
  const {
    debounce = 300,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    isTouched: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖验证
  const debouncedValidate = useCallback((val: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const result = validator(val, true);
      setValidation(result);
    }, debounce);
  }, [validator, debounce]);

  // 处理值变化
  useEffect(() => {
    if (validateOnChange) {
      if (value === '') {
        // 空值重置验证状态
        setValidation({
          isValid: true,
          isTouched: false,
        });
      } else {
        debouncedValidate(value);
      }
    }
  }, [value, validateOnChange, debouncedValidate]);

  // 处理失焦
  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      const result = validator(value, true);
      setValidation(result);
    }
  }, [value, validator, validateOnBlur]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    validation,
    handleBlur,
    isValid: validation.isValid,
    error: validation.error,
    isTouched: validation.isTouched,
  };
};

// 表单错误提示hook
export const useFormErrors = (validationState: {
  identifier: ValidationState;
  password?: ValidationState;
  code?: ValidationState;
}) => {
  const getError = useCallback((field: string): string | undefined => {
    const state = validationState[field as keyof typeof validationState];
    if (state && !state.isValid && state.isTouched) {
      return state.error;
    }
    return undefined;
  }, [validationState]);

  const hasErrors = useCallback((method: 'password' | 'otp'): boolean => {
    if (!validationState.identifier.isValid && validationState.identifier.isTouched) {
      return true;
    }

    if (method === 'password' && validationState.password) {
      if (!validationState.password.isValid && validationState.password.isTouched) {
        return true;
      }
    }

    if (method === 'otp' && validationState.code) {
      if (!validationState.code.isValid && validationState.code.isTouched) {
        return true;
      }
    }

    return false;
  }, [validationState]);

  const getAllErrors = useCallback((method: 'password' | 'otp'): Record<string, string> => {
    const errors: Record<string, string> = {};

    const identifierError = getError('identifier');
    if (identifierError) {
      errors.identifier = identifierError;
    }

    if (method === 'password') {
      const passwordError = getError('password');
      if (passwordError) {
        errors.password = passwordError;
      }
    } else {
      const codeError = getError('code');
      if (codeError) {
        errors.code = codeError;
      }
    }

    return errors;
  }, [getError]);

  return {
    getError,
    hasErrors,
    getAllErrors,
  };
};