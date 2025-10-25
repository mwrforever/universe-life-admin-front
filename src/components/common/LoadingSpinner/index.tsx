import React from 'react'
import { Spin } from 'antd'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'default', tip }) => {
  return <Spin size={size} tip={tip} />
}

export default LoadingSpinner