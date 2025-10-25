/**
 * 简单测试搜索组件
 */

import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const TestSearch: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>测试全局搜索</h2>
      <Input
        placeholder="搜索测试..."
        prefix={<SearchOutlined />}
        style={{ maxWidth: '400px' }}
      />
    </div>
  )
}

export default TestSearch