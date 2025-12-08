import React from 'react'
import { Spin } from 'antd'
import { useTheme } from '@/context/ThemeContext.tsx'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  spinning?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  tip = '加载中...',
  spinning = true
}) => {
  const { themeMode } = useTheme()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        backgroundColor: themeMode === 'dark' ? 'transparent' : 'transparent',
      }}
    >
      <Spin size={size} tip={tip} spinning={spinning} />
    </div>
  )
}

export default LoadingSpinner