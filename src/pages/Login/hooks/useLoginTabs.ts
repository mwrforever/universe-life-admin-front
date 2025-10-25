/**
 * 登录Tab切换状态管理hook
 */

import { useState, useCallback, useEffect } from 'react';
import { LoginMethod } from '../types/Login.types';
import { STORAGE_KEYS } from '../utils/constants';

interface UseLoginTabsOptions {
  defaultTab?: LoginMethod;
  saveToStorage?: boolean;
  onTabChange?: (tab: LoginMethod) => void;
}

interface UseLoginTabsReturn {
  activeTab: LoginMethod;
  setActiveTab: (tab: LoginMethod) => void;
  switchTab: (tab: LoginMethod) => void;
  tabItems: Array<{
    key: LoginMethod;
    label: string;
  }>;
}

export const useLoginTabs = (options: UseLoginTabsOptions = {}): UseLoginTabsReturn => {
  const {
    defaultTab = LoginMethod.OTP, // 默认选择验证码登录
    saveToStorage = true,
    onTabChange,
  } = options;

  const [activeTab, setActiveTabState] = useState<LoginMethod>(defaultTab);

  // Tab标签配置
  const tabItems = [
    {
      key: LoginMethod.OTP,
      label: '验证码登录',
    },
    {
      key: LoginMethod.PASSWORD,
      label: '密码登录',
    },
  ];

  // 从本地存储恢复上次选择的登录方式
  const restoreFromStorage = useCallback((): LoginMethod => {
    if (!saveToStorage) return defaultTab;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGIN_METHOD);
      if (stored && Object.values(LoginMethod).includes(stored as LoginMethod)) {
        return stored as LoginMethod;
      }
    } catch (error) {
      console.warn('Failed to restore login tab from storage:', error);
    }

    return defaultTab;
  }, [defaultTab, saveToStorage]);

  // 保存到本地存储
  const saveToStorageFunc = useCallback((tab: LoginMethod) => {
    if (!saveToStorage) return;

    try {
      localStorage.setItem(STORAGE_KEYS.LOGIN_METHOD, tab);
    } catch (error) {
      console.warn('Failed to save login tab to storage:', error);
    }
  }, [saveToStorage]);

  // 设置活跃Tab
  const setActiveTab = useCallback((tab: LoginMethod) => {
    if (tab === activeTab) return; // 避免重复设置

    setActiveTabState(tab);
    saveToStorageFunc(tab);
    onTabChange?.(tab);
  }, [activeTab, saveToStorageFunc, onTabChange]);

  // 切换Tab（带动画效果）
  const switchTab = useCallback((tab: LoginMethod) => {
    // 这里可以添加切换动画逻辑
    setActiveTab(tab);
  }, [setActiveTab]);

  // 组件挂载时恢复上次的选择
  useEffect(() => {
    const restoredTab = restoreFromStorage();
    if (restoredTab !== defaultTab) {
      setActiveTabState(restoredTab);
    }
  }, [restoreFromStorage, defaultTab]);

  return {
    activeTab,
    setActiveTab,
    switchTab,
    tabItems,
  };
};

// Tab切换动画hook
export const useTabAnimation = (isActive: boolean, duration: number = 300) => {
  const [isVisible, setIsVisible] = useState<boolean>(isActive);
  const [shouldRender, setShouldRender] = useState<boolean>(isActive);

  useEffect(() => {
    if (isActive) {
      // 显示动画
      setShouldRender(true);
      // 延迟一小段时间后显示内容，用于动画效果
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // 隐藏动画
      setIsVisible(false);
      // 等待动画完成后移除组件
      setTimeout(() => setShouldRender(false), duration);
    }
  }, [isActive, duration]);

  return {
    shouldRender,
    isVisible,
    animationStyle: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      transition: `all ${duration}ms ease-in-out`,
    },
  };
};

// Tab切换历史记录hook
export const useTabHistory = () => {
  const [history, setHistory] = useState<LoginMethod[]>([]);

  const addToHistory = useCallback((tab: LoginMethod) => {
    setHistory(prev => {
      const newHistory = [...prev, tab];
      // 只保留最近10次切换记录
      return newHistory.slice(-10);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getMostUsedTab = useCallback((): LoginMethod | null => {
    if (history.length === 0) return null;

    const counts = history.reduce((acc, tab) => {
      acc[tab] = (acc[tab] || 0) + 1;
      return acc;
    }, {} as Record<LoginMethod, number>);

    return Object.entries(counts).reduce((a, b) =>
      counts[a[0] as LoginMethod] > counts[b[0] as LoginMethod] ? a : b
    )[0] as LoginMethod;
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getMostUsedTab,
    totalSwitches: history.length,
  };
};

// Tab访问统计分析hook
export const useTabAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    otpVisits: 0,
    passwordVisits: 0,
    averageVisitDuration: 0,
    lastVisitTime: 0,
  });

  const recordTabVisit = useCallback((tab: LoginMethod, duration?: number) => {
    setAnalytics(prev => ({
      ...prev,
      totalVisits: prev.totalVisits + 1,
      otpVisits: tab === LoginMethod.OTP ? prev.otpVisits + 1 : prev.otpVisits,
      passwordVisits: tab === LoginMethod.PASSWORD ? prev.passwordVisits + 1 : prev.passwordVisits,
      averageVisitDuration: duration ?
        (prev.averageVisitDuration * prev.totalVisits + duration) / (prev.totalVisits + 1) :
        prev.averageVisitDuration,
      lastVisitTime: Date.now(),
    }));
  }, []);

  const getTabPreference = useCallback(): 'otp' | 'password' | 'neutral' => {
    const { otpVisits, passwordVisits } = analytics;
    const total = otpVisits + passwordVisits;

    if (total === 0) return 'neutral';

    const otpPercentage = (otpVisits / total) * 100;
    const passwordPercentage = (passwordVisits / total) * 100;

    if (otpPercentage > 60) return 'otp';
    if (passwordPercentage > 60) return 'password';
    return 'neutral';
  }, [analytics]);

  return {
    analytics,
    recordTabVisit,
    getTabPreference,
  };
};