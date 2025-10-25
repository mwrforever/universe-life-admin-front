/**
 * 交易历史页面
 */

import React from 'react'
import { Card, Typography, Table, Space, Button, DatePicker, Select } from 'antd'
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { RangePicker } = DatePicker

interface Transaction {
  id: string
  orderId: string
  type: 'payment' | 'refund' | 'withdrawal'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  createdAt: string
}

const TransactionHistory: React.FC = () => {
  // 模拟数据
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      orderId: 'ORD-001',
      type: 'payment',
      amount: 299.00,
      currency: 'CNY',
      status: 'completed',
      description: '高级会员订阅',
      createdAt: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      orderId: 'ORD-002',
      type: 'refund',
      amount: -199.00,
      currency: 'CNY',
      status: 'completed',
      description: '退款处理',
      createdAt: '2024-01-16 14:20:00'
    }
  ]

  const columns: ColumnsType<Transaction> = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span style={{ color: amount < 0 ? '#52c41a' : '#1890ff' }}>
          {record.currency} {Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            交易历史
          </Title>
          <Space>
            <RangePicker />
            <Button icon={<DownloadOutlined />}>
              导出
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={mockTransactions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  )
}

export default TransactionHistory