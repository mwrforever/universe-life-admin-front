/**
 * 支付管理页面
 */

import React, { useState } from 'react'
import { Card, Button, Space, Table, Tag, Input, Select, DatePicker, Modal, message, Statistic, Row, Col, Typography } from 'antd'
import { SearchOutlined, EyeOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input
const { RangePicker } = DatePicker

interface Payment {
  id: string
  orderId: string
  userId: string
  username: string
  amount: number
  currency: string
  method: 'alipay' | 'wechat' | 'bank_card' | 'paypal'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  description: string
  createdAt: string
  completedAt?: string
}

const PaymentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<[any, any] | null>(null)
  const navigate = useNavigate()

  // 模拟数据
  const mockPayments: Payment[] = [
    {
      id: '1',
      orderId: 'ORD-2024-001',
      userId: 'user1',
      username: '张三',
      amount: 299.00,
      currency: 'CNY',
      method: 'alipay',
      status: 'completed',
      description: '高级会员订阅',
      createdAt: '2024-01-15 10:30:00',
      completedAt: '2024-01-15 10:31:00'
    },
    {
      id: '2',
      orderId: 'ORD-2024-002',
      userId: 'user2',
      username: '李四',
      amount: 199.00,
      currency: 'CNY',
      method: 'wechat',
      status: 'pending',
      description: '基础会员订阅',
      createdAt: '2024-01-16 14:20:00'
    },
    {
      id: '3',
      orderId: 'ORD-2024-003',
      userId: 'user3',
      username: '王五',
      amount: 599.00,
      currency: 'CNY',
      method: 'bank_card',
      status: 'failed',
      description: '企业版订阅',
      createdAt: '2024-01-17 09:15:00'
    },
    {
      id: '4',
      orderId: 'ORD-2024-004',
      userId: 'user4',
      username: '赵六',
      amount: 99.00,
      currency: 'USD',
      method: 'paypal',
      status: 'processing',
      description: '月度订阅',
      createdAt: '2024-01-18 16:45:00'
    },
    {
      id: '5',
      orderId: 'ORD-2024-005',
      userId: 'user5',
      username: '钱七',
      amount: 299.00,
      currency: 'CNY',
      method: 'alipay',
      status: 'refunded',
      description: '高级会员订阅',
      createdAt: '2024-01-19 11:30:00',
      completedAt: '2024-01-19 15:20:00'
    }
  ]

  React.useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    // 这里应该调用API获取支付记录
    setTimeout(() => {
      setPayments(mockPayments)
      setLoading(false)
    }, 500)
  }

  const handleView = (id: string) => {
    navigate(`/payments/${id}`)
  }

  const handleRefund = async (id: string) => {
    Modal.confirm({
      title: '确认退款',
      content: '确定要处理这笔退款吗？',
      onOk: async () => {
        try {
          // 这里应该调用API处理退款
          message.success('退款处理成功')
          fetchPayments()
        } catch (error) {
          message.error('退款处理失败')
        }
      }
    })
  }

  const handleExport = () => {
    // 导出支付记录
    message.info('导出功能开发中...')
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'default',
      refunded: 'purple'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: '待支付',
      processing: '处理中',
      completed: '已完成',
      failed: '支付失败',
      cancelled: '已取消',
      refunded: '已退款'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getMethodColor = (method: string) => {
    const colors = {
      alipay: 'blue',
      wechat: 'green',
      bank_card: 'orange',
      paypal: 'purple'
    }
    return colors[method as keyof typeof colors] || 'default'
  }

  const getMethodText = (method: string) => {
    const texts = {
      alipay: '支付宝',
      wechat: '微信支付',
      bank_card: '银行卡',
      paypal: 'PayPal'
    }
    return texts[method as keyof typeof texts] || method
  }

  const getPaymentStats = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const completed = payments.filter(p => p.status === 'completed')
    const completedAmount = completed.reduce((sum, payment) => sum + payment.amount, 0)
    const pending = payments.filter(p => p.status === 'pending').length
    const processing = payments.filter(p => p.status === 'processing').length

    return {
      total,
      completedAmount,
      pending,
      processing,
      totalTransactions: payments.length
    }
  }

  const stats = getPaymentStats()

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
                         payment.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter

    let matchesDateRange = true
    if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
      const paymentDate = new Date(payment.createdAt)
      matchesDateRange = paymentDate >= selectedDateRange[0].toDate() &&
                        paymentDate <= selectedDateRange[1].toDate()
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange
  })

  const columns: ColumnsType<Payment> = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text: string, record: Payment) => (
        <a onClick={() => handleView(record.id)} style={{ color: '#1890ff', cursor: 'pointer' }}>
          {text}
        </a>
      ),
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Payment) => (
        <Space>
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {record.currency} {amount.toFixed(2)}
          </span>
        </Space>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '支付方式',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={getMethodColor(method)}>
          {getMethodText(method)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => text,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          {record.status === 'completed' && (
            <Button
              type="text"
              onClick={() => handleRefund(record.id)}
              style={{ color: '#fa8c16' }}
            >
              退款
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0, marginBottom: '24px' }}>
            支付管理
          </Title>

          {/* 统计卡片 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Statistic
                title="总交易额"
                value={stats.total}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="CNY"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已完成金额"
                value={stats.completedAmount}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="CNY"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="待支付"
                value={stats.pending}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="处理中"
                value={stats.processing}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Space>
              <Search
                placeholder="搜索订单号、用户或描述"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                style={{ width: 300 }}
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Select
                placeholder="状态筛选"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="pending">待支付</Select.Option>
                <Select.Option value="processing">处理中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="failed">支付失败</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
                <Select.Option value="refunded">已退款</Select.Option>
              </Select>
              <Select
                placeholder="支付方式"
                style={{ width: 120 }}
                value={methodFilter}
                onChange={(value) => setMethodFilter(value)}
              >
                <Select.Option value="all">全部方式</Select.Option>
                <Select.Option value="alipay">支付宝</Select.Option>
                <Select.Option value="wechat">微信支付</Select.Option>
                <Select.Option value="bank_card">银行卡</Select.Option>
                <Select.Option value="paypal">PayPal</Select.Option>
              </Select>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => setSelectedDateRange(dates)}
              />
            </Space>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                导出记录
              </Button>
            </Space>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredPayments.length,
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

export default PaymentManagement