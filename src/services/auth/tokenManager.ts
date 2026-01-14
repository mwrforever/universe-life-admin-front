/**
 * Token管理器
 * 负责令牌的存储、获取、刷新和清理
 * 基于后端接口文档 v1.0.0
 */

import { authLogger } from '@/utils/logger';
import type { SysUserProfileVO } from '@/services/system/sysUserProfileApi';

// 用户基本信息（用于导航栏等轻量展示）
export interface UserInfo {
  employeeNo: string;       // 员工工号
  userAvatar: string;       // 原始头像key（未签名），用于按需签名
}

// 完整用户资料缓存
export type UserProfile = SysUserProfileVO;

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'universe_access_token',
  REFRESH_TOKEN: 'universe_refresh_token',
  USER_INFO: 'universe_user_info',
  USER_PROFILE: 'universe_user_profile',  // 完整用户资料缓存
  TOKEN_EXPIRES_AT: 'universe_token_expires_at',
  REFRESH_EXPIRES_AT: 'universe_refresh_expires_at',
};

export class TokenManager {
  /**
   * 存储访问令牌及过期时间
   * @param token - 访问令牌
   * @param expiresIn - 过期时间（秒）
   */
  static setAccessToken(token: string, expiresIn: number): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    // expiresIn 是相对时间（秒），转换为绝对过期时间（毫秒时间戳）
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRES_AT, expiresAt.toString());
    authLogger.info('✅ Access Token已存储，过期时间:', new Date(expiresAt).toLocaleString());
  }

  /**
   * 获取访问令牌（过期返回null）
   * 每次获取时都会检查是否过期，确保只返回有效token
   */
  static getAccessToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);

    if (!token) {
      return null;
    }

    // 检查是否过期
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      authLogger.warn('⚠️ Access Token已过期');
      return null;
    }

    return token;
  }

  /**
   * 存储刷新令牌
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    authLogger.info('✅ Refresh Token已存储');
  }

  /**
   * 获取刷新令牌
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * 存储用户信息
   */
  static setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo));
    authLogger.info('✅ 用户信息已存储:', userInfo.employeeNo);
  }


  /**
   * 更新用户信息（合并现有信息）
   * 触发 storage 事件以同步其他标签页/组件
   */
  static updateUserInfo(updates: Partial<UserInfo>): void {
    const currentInfo = this.getUserInfo();
    if (currentInfo) {
      const updatedInfo = { ...currentInfo, ...updates };
      this.setUserInfo(updatedInfo);
      // 手动触发 storage 事件以通知同一页面的其他组件
      window.dispatchEvent(new StorageEvent('storage', {
        key: TOKEN_KEYS.USER_INFO,
        newValue: JSON.stringify(updatedInfo),
        oldValue: JSON.stringify(currentInfo),
      }));
      authLogger.info('✅ 用户信息已更新并触发同步');
    } else {
      // 如果没有现有信息，创建新的用户信息
      this.setUserInfo(updates as UserInfo);
    }
  }

  /**
   * 获取用户信息
   */
  static getUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem(TOKEN_KEYS.USER_INFO);
    if (!userInfoStr) {
      return null;
    }
    try {
      return JSON.parse(userInfoStr) as UserInfo;
    } catch {
      authLogger.error('❌ 解析用户信息失败');
      return null;
    }
  }

  /**
   * 存储完整用户资料
   */
  static setUserProfile(profile: UserProfile): void {
    localStorage.setItem(TOKEN_KEYS.USER_PROFILE, JSON.stringify(profile));
    // 同时更新简化的 UserInfo（用于导航栏等）
    this.setUserInfo({
      employeeNo: profile.employeeNo,
      userAvatar: profile.avatarUrl || '',
    });
    authLogger.info('✅ 用户资料已缓存:', profile.employeeNo);
  }

  /**
   * 获取完整用户资料
   */
  static getUserProfile(): UserProfile | null {
    const profileStr = localStorage.getItem(TOKEN_KEYS.USER_PROFILE);
    if (!profileStr) {
      return null;
    }
    try {
      return JSON.parse(profileStr) as UserProfile;
    } catch {
      authLogger.error('❌ 解析用户资料失败');
      return null;
    }
  }

  /**
   * 更新用户资料（合并现有信息）
   * 触发 storage 事件以同步其他标签页/组件
   */
  static updateUserProfile(updates: Partial<UserProfile>): void {
    const currentProfile = this.getUserProfile();
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, ...updates };
      localStorage.setItem(TOKEN_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      // 同时更新简化的 UserInfo
      this.updateUserInfo({
        employeeNo: updatedProfile.employeeNo,
        userAvatar: updatedProfile.avatarUrl || '',
      });
      // 手动触发 storage 事件以通知同一页面的其他组件
      window.dispatchEvent(new StorageEvent('storage', {
        key: TOKEN_KEYS.USER_PROFILE,
        newValue: JSON.stringify(updatedProfile),
        oldValue: JSON.stringify(currentProfile),
      }));
      authLogger.info('✅ 用户资料已更新并触发同步');
    } else {
      this.setUserProfile(updates as UserProfile);
    }
  }

  /**
   * 清除所有令牌和用户信息
   */
  static clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER_INFO);
    localStorage.removeItem(TOKEN_KEYS.USER_PROFILE);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_EXPIRES_AT);
    authLogger.info('🧹 所有Token和认证数据已清除');
  }

  /**
   * 检查令牌是否已过期
   * @returns {boolean} true=已过期或不存在, false=仍然有效
   */
  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRES_AT);
    if (!expiresAt) {
      return true; // 没有过期时间记录，视为已过期
    }
    return Date.now() > parseInt(expiresAt, 10);
  }

  /**
   * 检查是否已登录
   * @returns {boolean} true=已登录（token有效）, false=未登录
   */
  static isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * 存储登录信息（从API响应的TokenData中保存）
   * 注意：新的登录接口返回的data字段直接包含accessToken等camelCase字段
   */
  static saveLoginData(tokenData: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;  // 可能是秒数（如 "3600"）或毫秒时间戳（如 "1767352677867"）
    tokenType: string;
  }): void {
    // 🐛 调试：打印传入的 tokenData
    authLogger.info('📦 saveLoginData 接收到参数:', tokenData);
    authLogger.info('📦 accessToken 类型:', typeof tokenData.accessToken);
    authLogger.info('📦 refreshToken 类型:', typeof tokenData.refreshToken);
    authLogger.info('📦 expiresIn 值:', tokenData.expiresIn, '类型:', typeof tokenData.expiresIn);
    authLogger.info('📦 tokenType:', tokenData.tokenType);

    // expiresIn 可能是秒数或毫秒时间戳，转换为数字传给 setAccessToken
    // setAccessToken 会自动判断是相对时间还是绝对时间
    const expiresInValue = parseInt(tokenData.expiresIn, 10);
    authLogger.info('📦 转换后的 expiresInValue:', expiresInValue);

    this.setAccessToken(tokenData.accessToken, expiresInValue);
    this.setRefreshToken(tokenData.refreshToken);

    // 注意：登录后需要调用 getProfile 接口获取用户信息

    authLogger.info('✅ 登录数据已存储');
  }
}

export default TokenManager;
