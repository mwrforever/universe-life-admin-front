/**
 * 报告页面
 */

import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Reports: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>报告管理</Title>
        <p>报告功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Reports