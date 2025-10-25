/**
 * 登录页面类型定义
 */

// 登录方式枚举
export enum LoginMethod {
  PASSWORD = 'password',    // 密码登录
  OTP = 'otp',             // 验证码登录
}

// 第三方登录提供商
export enum OAuthProvider {
  WECHAT = 'wechat',
  QQ = 'qq',
  ALIPAY = 'alipay',
  WEIBO = 'weibo',
}

// 用户登录信息
export interface LoginCredentials {
  identifier: string;    // 手机号/邮箱/账号
  password?: string;     // 密码（密码登录时）
  code?: string;         // 验证码（验证码登录时）
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

// 表单验证状态
export interface ValidationState {
  isValid: boolean;
  error?: string;
  isTouched: boolean;
}

// 登录表单状态
export interface LoginFormState {
  method: LoginMethod;
  credentials: LoginCredentials;
  validation: {
    identifier: ValidationState;
    password: ValidationState;
    code: ValidationState;
  };
  isSubmitting: boolean;
  agreementAccepted: boolean;
}

// 第三方登录配置
export interface OAuthConfig {
  provider: OAuthProvider;
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  authUrl: string;
}

// 验证码配置
export interface OtpConfig {
  countdown: number;
  maxAttempts: number;
  cooldownPeriod: number;
  maxDailyAttempts: number;
}

// 登录响应数据
export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: UserInfo;
  message?: string;
  errors?: Record<string, string>;
}

// 用户信息
export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
}

// 组件Props类型
export interface LoginCardProps {
  className?: string;
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: string) => void;
}

export interface BrandSectionProps {
  className?: string;
}

export interface LoginTabsProps {
  activeTab: LoginMethod;
  onChange: (method: LoginMethod) => void;
  className?: string;
}

export interface PasswordFormProps {
  formData: LoginFormState;
  onChange: (state: Partial<LoginFormState>) => void;
  onSubmit: () => void;
  className?: string;
}

export interface OtpFormProps {
  formData: LoginFormState;
  onChange: (state: Partial<LoginFormState>) => void;
  onSubmit: () => void;
  onSendCode: () => void;
  countdown: number;
  className?: string;
}

export interface ThirdPartyLoginProps {
  onOAuthLogin: (provider: OAuthProvider) => void;
  className?: string;
}

export interface AgreementCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

// 响应式断点
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

// 动画配置
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}