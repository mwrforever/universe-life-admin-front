/**
 * 数据分析页面
 */

import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Analytics: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>数据分析</Title>
        <p>数据分析功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Analytics