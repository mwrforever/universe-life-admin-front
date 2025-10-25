/**
 * 报告详情页面
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography } from 'antd'

const { Title } = Typography

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>报告详情</Title>
        <p>报告ID: {id}</p>
        <p>报告详情功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default ReportDetail