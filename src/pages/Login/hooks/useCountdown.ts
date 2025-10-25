/**
 * 验证码倒计时hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OTP_CONFIG, STORAGE_KEYS } from '../utils/constants';

interface UseCountdownOptions {
  initialCountdown?: number;
  storageKey?: string;
  onExpire?: () => void;
  onStart?: () => void;
}

interface UseCountdownReturn {
  countdown: number;
  isActive: boolean;
  isExpired: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  canResend: boolean;
  remainingTime: string;
}

export const useCountdown = (options: UseCountdownOptions = {}): UseCountdownReturn => {
  const {
    initialCountdown = OTP_CONFIG.countdown,
    storageKey = STORAGE_KEYS.OTP_COOLDOWN,
    onExpire,
    onStart,
  } = options;

  const [countdown, setCountdown] = useState<number>(initialCountdown);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化剩余时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 从本地存储恢复倒计时状态
  const restoreFromStorage = useCallback((): number => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { timestamp, remaining } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        const newRemaining = Math.max(0, remaining - elapsed);

        if (newRemaining > 0) {
          return newRemaining;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.warn('Failed to restore countdown from storage:', error);
      localStorage.removeItem(storageKey);
    }
    return initialCountdown;
  }, [storageKey, initialCountdown]);

  // 保存倒计时状态到本地存储
  const saveToStorage = useCallback((remaining: number) => {
    try {
      if (remaining > 0) {
        localStorage.setItem(storageKey, JSON.stringify({
          timestamp: Date.now(),
          remaining,
        }));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn('Failed to save countdown to storage:', error);
    }
  }, [storageKey]);

  // 开始倒计时
  const start = useCallback(() => {
    if (isActive) return;

    setIsActive(true);
    setIsExpired(false);
    setCountdown(initialCountdown);
    saveToStorage(initialCountdown);
    onStart?.();
  }, [isActive, initialCountdown, saveToStorage, onStart]);

  // 停止倒计时
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    saveToStorage(0);
  }, [saveToStorage]);

  // 重置倒计时
  const reset = useCallback(() => {
    stop();
    setCountdown(initialCountdown);
    setIsExpired(false);
  }, [stop, initialCountdown]);

  // 倒计时逻辑
  useEffect(() => {
    if (isActive && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const newCountdown = prev - 1;
          saveToStorage(newCountdown);

          if (newCountdown <= 0) {
            setIsActive(false);
            setIsExpired(true);
            onExpire?.();
            return 0;
          }

          return newCountdown;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, countdown, saveToStorage, onExpire]);

  // 组件挂载时恢复倒计时状态
  useEffect(() => {
    const restoredCountdown = restoreFromStorage();
    if (restoredCountdown < initialCountdown) {
      setCountdown(restoredCountdown);
      if (restoredCountdown > 0) {
        setIsActive(true);
      } else {
        setIsExpired(true);
      }
    }
  }, [restoreFromStorage, initialCountdown]);

  // 检查是否可以重新发送
  const canResend = !isActive && (isExpired || countdown === initialCountdown);

  return {
    countdown,
    isActive,
    isExpired,
    start,
    stop,
    reset,
    canResend,
    remainingTime: formatTime(countdown),
  };
};

// 验证码尝试次数限制hook
export const useOtpAttempts = (identifier: string) => {
  const [attempts, setAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number>(0);

  const getAttemptsStorageKey = () => `${STORAGE_KEYS.OTP_ATTEMPTS}_${identifier}`;
  const getLockStorageKey = () => `${STORAGE_KEYS.OTP_ATTEMPTS}_${identifier}_lock`;

  // 检查是否被锁定
  const checkLockStatus = useCallback(() => {
    try {
      const lockData = localStorage.getItem(getLockStorageKey());
      if (lockData) {
        const { timestamp, duration } = JSON.parse(lockData);
        const elapsed = Date.now() - timestamp;
        const remaining = Math.max(0, duration - elapsed);

        if (remaining > 0) {
          setIsLocked(true);
          setLockTimeRemaining(Math.ceil(remaining / 1000));
          return true;
        } else {
          localStorage.removeItem(getLockStorageKey());
        }
      }
    } catch (error) {
      console.warn('Failed to check lock status:', error);
    }

    setIsLocked(false);
    setLockTimeRemaining(0);
    return false;
  }, [identifier]);

  // 增加尝试次数
  const incrementAttempts = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    try {
      localStorage.setItem(getAttemptsStorageKey(), JSON.stringify({
        attempts: newAttempts,
        timestamp: Date.now(),
      }));

      // 如果超过最大尝试次数，锁定账户
      if (newAttempts >= OTP_CONFIG.maxAttempts) {
        const lockDuration = OTP_CONFIG.cooldownPeriod * 1000; // 转换为毫秒
        localStorage.setItem(getLockStorageKey(), JSON.stringify({
          timestamp: Date.now(),
          duration: lockDuration,
        }));
        setIsLocked(true);
        setLockTimeRemaining(OTP_CONFIG.cooldownPeriod);
      }
    } catch (error) {
      console.warn('Failed to save attempts:', error);
    }
  }, [attempts]);

  // 重置尝试次数（成功验证后调用）
  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setIsLocked(false);
    setLockTimeRemaining(0);

    try {
      localStorage.removeItem(getAttemptsStorageKey());
      localStorage.removeItem(getLockStorageKey());
    } catch (error) {
      console.warn('Failed to reset attempts:', error);
    }
  }, []);

  // 获取今日尝试次数
  const getDailyAttempts = useCallback((): number => {
    try {
      const today = new Date().toDateString();
      const dailyData = localStorage.getItem(`${STORAGE_KEYS.OTP_ATTEMPTS}_daily_${today}`);
      return dailyData ? JSON.parse(dailyData).attempts : 0;
    } catch (error) {
      console.warn('Failed to get daily attempts:', error);
      return 0;
    }
  }, []);

  // 检查是否超过每日限制
  const isDailyLimitExceeded = useCallback((): boolean => {
    return getDailyAttempts() >= OTP_CONFIG.maxDailyAttempts;
  }, [getDailyAttempts]);

  // 组件挂载时检查状态
  useEffect(() => {
    checkLockStatus();
  }, [checkLockStatus]);

  // 锁定倒计时
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isLocked && lockTimeRemaining === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTimeRemaining]);

  return {
    attempts,
    isLocked,
    lockTimeRemaining,
    canAttempt: !isLocked && !isDailyLimitExceeded(),
    incrementAttempts,
    resetAttempts,
    isDailyLimitExceeded,
    dailyAttempts: getDailyAttempts(),
  };
};