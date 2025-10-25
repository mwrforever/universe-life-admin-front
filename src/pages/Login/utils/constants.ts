/**
 * 登录页面常量配置
 */

import { OAuthProvider, Breakpoints, OtpConfig } from '../types/Login.types';

// 第三方登录配置
export const OAUTH_CONFIGS = {
  [OAuthProvider.WECHAT]: {
    provider: OAuthProvider.WECHAT,
    name: '微信',
    icon: 'wechat',
    color: '#07C160',
    hoverColor: '#06AD56',
    authUrl: '/api/auth/wechat',
  },
  [OAuthProvider.QQ]: {
    provider: OAuthProvider.QQ,
    name: 'QQ',
    icon: 'qq',
    color: '#12B7F5',
    hoverColor: '#0EA5E9',
    authUrl: '/api/auth/qq',
  },
  [OAuthProvider.ALIPAY]: {
    provider: OAuthProvider.ALIPAY,
    name: '支付宝',
    icon: 'alipay',
    color: '#1677FF',
    hoverColor: '#0958D9',
    authUrl: '/api/auth/alipay',
  },
  [OAuthProvider.WEIBO]: {
    provider: OAuthProvider.WEIBO,
    name: '微博',
    icon: 'weibo',
    color: '#FF6B00',
    hoverColor: '#E55A00',
    authUrl: '/api/auth/weibo',
  },
} as const;

// 验证码配置
export const OTP_CONFIG: OtpConfig = {
  countdown: 60,              // 倒计时60秒
  maxAttempts: 3,             // 最大尝试次数
  cooldownPeriod: 300,        // 冷却期5分钟
  maxDailyAttempts: 10,       // 每日最大尝试次数
};

// 响应式断点
export const BREAKPOINTS: Breakpoints = {
  mobile: 768,      // < 768px 为移动端
  tablet: 1199,     // 768px - 1199px 为平板端
  desktop: 1200,    // ≥ 1200px 为桌面端
};

// 卡片宽度配置
export const CARD_WIDTHS = {
  desktop: '400px',
  tablet: '360px',
  mobile: 'calc(100% - 32px)',
};

// 表单验证规则
export const VALIDATION_RULES = {
  // 手机号验证规则
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    minLength: 11,
    maxLength: 11,
    message: '请输入正确的11位手机号码',
  },
  // 邮箱验证规则
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入正确的邮箱地址',
  },
  // 账号验证规则
  username: {
    minLength: 4,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '账号只能包含字母、数字和下划线，长度4-20位',
  },
  // 密码验证规则
  password: {
    minLength: 6,
    maxLength: 50,
    message: '密码长度应为6-50位',
  },
  // 验证码验证规则
  code: {
    pattern: /^\d{6}$/,
    message: '请输入6位数字验证码',
  },
};

// 动画持续时间
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// 动画缓动函数
export const ANIMATION_EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
};

// 本地存储键名
export const STORAGE_KEYS = {
  LOGIN_METHOD: 'login_method',
  OTP_COOLDOWN: 'otp_cooldown',
  OTP_ATTEMPTS: 'otp_attempts',
  LAST_LOGIN: 'last_login',
};

// API端点
export const API_ENDPOINTS = {
  LOGIN_PASSWORD: '/api/auth/login/password',
  LOGIN_OTP: '/api/auth/login/otp',
  SEND_OTP: '/api/auth/otp/send',
  VERIFY_OTP: '/api/auth/otp/verify',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
};

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接异常，请检查网络后重试',
  INVALID_CREDENTIALS: '用户名或密码错误',
  INVALID_CODE: '验证码错误或已过期',
  CODE_EXPIRED: '验证码已过期，请重新获取',
  TOO_MANY_ATTEMPTS: '尝试次数过多，请稍后再试',
  ACCOUNT_LOCKED: '账户已被锁定，请联系客服',
  SERVER_ERROR: '服务器错误，请稍后再试',
  AGREEMENT_REQUIRED: '请同意用户协议和隐私政策',
};

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  CODE_SENT: '验证码已发送',
  LOGOUT_SUCCESS: '退出登录成功',
};

// 占位符文本
export const PLACEHOLDERS = {
  IDENTIFIER: '手机号/邮箱/账号',
  PASSWORD: '请输入密码',
  PHONE: '请输入手机号',
  EMAIL: '请输入邮箱',
  CODE: '请输入验证码',
};

// 按钮文本
export const BUTTON_TEXTS = {
  LOGIN: '登录',
  REGISTER: '注册',
  FORGOT_PASSWORD: '忘记密码？',
  SEND_CODE: '获取验证码',
  RESEND_CODE: '重新发送',
  LOGIN_WITH_PASSWORD: '密码登录',
  LOGIN_WITH_OTP: '验证码登录',
  THIRD_PARTY_LOGIN: '第三方登录',
  AGREEMENT: '我已阅读并同意',
  USER_AGREEMENT: '《用户协议》',
  PRIVACY_POLICY: '《隐私政策》',
};