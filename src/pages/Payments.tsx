/**
 * 支付管理页面
 */

import React, { useEffect } from 'react'
import { Card, Typography, Table, Tag, Space, Button, Input, Select, DatePicker, Row, Col, Statistic } from 'antd'
import {
  CreditCardOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input
const { RangePicker } = DatePicker

interface PaymentRecord {
  key: string
  id: string
  userId: string
  userName: string
  amount: number
  type: string
  status: 'success' | 'pending' | 'failed'
  method: string
  orderId: string
  createTime: string
  completeTime?: string
}

function Payments() {
  useEffect(() => {
    console.log('💳 支付管理组件已挂载')
  }, [])

  // 模拟支付记录数据
  const paymentData: PaymentRecord[] = [
    {
      key: '1',
      id: 'PAY-2025-001',
      userId: 'USR-001',
      userName: '张三',
      amount: 299.00,
      type: '会员订阅',
      status: 'success',
      method: '支付宝',
      orderId: 'ORD-2025-001',
      createTime: '2025-10-21 10:30:00',
      completeTime: '2025-10-21 10:30:15'
    },
    {
      key: '2',
      id: 'PAY-2025-002',
      userId: 'USR-002',
      userName: '李四',
      amount: 599.00,
      type: '会员订阅',
      status: 'pending',
      method: '微信支付',
      orderId: 'ORD-2025-002',
      createTime: '2025-10-21 11:15:00'
    },
    {
      key: '3',
      id: 'PAY-2025-003',
      userId: 'USR-003',
      userName: '王五',
      amount: 199.00,
      type: '服务购买',
      status: 'failed',
      method: '银行卡',
      orderId: 'ORD-2025-003',
      createTime: '2025-10-21 12:20:00'
    },
    {
      key: '4',
      id: 'PAY-2025-004',
      userId: 'USR-004',
      userName: '赵六',
      amount: 899.00,
      type: '会员订阅',
      status: 'success',
      method: '支付宝',
      orderId: 'ORD-2025-004',
      createTime: '2025-10-21 13:45:00',
      completeTime: '2025-10-21 13:45:12'
    }
  ]

  const columns: ColumnsType<PaymentRecord> = [
    {
      title: '支付编号',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{text}</span>
      )
    },
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.userName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.userId}</div>
        </div>
      )
    },
    {
      title: '支付金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: '#0052D9', fontWeight: 600, fontSize: '16px' }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: '支付类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colorMap = {
          '会员订阅': 'blue',
          '服务购买': 'green',
          '充值': 'orange',
          '退款': 'red'
        }
        return <Tag color={colorMap[type as keyof typeof colorMap] || 'default'}>{type}</Tag>
      }
    },
    {
      title: '支付状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          success: { color: 'success', text: '成功', icon: <CheckCircleOutlined /> },
          pending: { color: 'processing', text: '处理中', icon: <ClockCircleOutlined /> },
          failed: { color: 'error', text: '失败', icon: <ExclamationCircleOutlined /> }
        }
        const config = statusMap[status as keyof typeof statusMap]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '支付方式',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" style={{ color: '#0052D9' }}>
              人工处理
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          💳 支付管理
        </Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={12580}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#0052D9' }}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日交易"
              value={156}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#07C160' }}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="成功率"
              value={96.8}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#FF9F00' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理"
              value={12}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#86909C' }}
              suffix="笔"
            />
          </Card>
        </Col>
      </Row>

      {/* 支付记录表格 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              支付记录
            </Title>
          </div>
          <Space>
            <Search
              placeholder="搜索用户、订单号..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="success">成功</Select.Option>
              <Select.Option value="pending">处理中</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button icon={<FilterOutlined />}>筛选</Button>
            <Button icon={<DownloadOutlined />}>导出</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={paymentData}
          pagination={{
            total: paymentData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </>
  )
}

export default Payments