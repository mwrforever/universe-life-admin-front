/**
 * 主题上下文 - 管理全局主题状态
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import { getThemeConfig } from '../styles/theme'

// 主题类型定义
export type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
  isDark: boolean
  themeMode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode | null
    return savedTheme || 'light'
  })

  const isDark = themeMode === 'dark'

  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode)
    document.documentElement.setAttribute('data-theme', themeMode)
  }, [themeMode])

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value: ThemeContextType = {
    isDark,
    themeMode,
    toggleTheme,
    setThemeMode,
  }

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={getThemeConfig(isDark)}
        componentSize="middle"
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}