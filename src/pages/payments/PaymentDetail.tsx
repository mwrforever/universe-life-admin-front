/**
 * 支付详情页面
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, Descriptions, Tag, Spin, Space, message, Modal, Timeline, Row, Col } from 'antd'
import { ArrowLeftOutlined, ExclamationCircleOutlined, DollarOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Title } = Typography

interface Payment {
  id: string
  orderId: string
  userId: string
  username: string
  email: string
  amount: number
  currency: string
  method: 'alipay' | 'wechat' | 'bank_card' | 'paypal'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  description: string
  createdAt: string
  completedAt?: string
  transactionId?: string
  refundAmount?: number
  refundReason?: string
  refundAt?: string
}

interface PaymentLog {
  id: string
  action: string
  description: string
  createdAt: string
  operator: string
}

const PaymentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [refundModalVisible, setRefundModalVisible] = useState(false)
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([])

  useEffect(() => {
    if (id) {
      fetchPayment()
    }
  }, [id])

  const fetchPayment = async () => {
    setLoading(true)
    try {
      // 这里应该调用API获取支付详情
      // 模拟数据
      const mockPayment: Payment = {
        id: id || '1',
        orderId: 'ORD-2024-001',
        userId: 'user1',
        username: '张三',
        email: 'zhangsan@example.com',
        amount: 299.00,
        currency: 'CNY',
        method: 'alipay',
        status: 'completed',
        description: '高级会员订阅 - 年度套餐',
        createdAt: '2024-01-15 10:30:00',
        completedAt: '2024-01-15 10:31:00',
        transactionId: 'ALI-2024-001-XYZ123'
      }

      const mockLogs: PaymentLog[] = [
        {
          id: '1',
          action: '创建订单',
          description: '用户创建了支付订单',
          createdAt: '2024-01-15 10:30:00',
          operator: '系统'
        },
        {
          id: '2',
          action: '开始支付',
          description: '用户跳转到支付宝页面',
          createdAt: '2024-01-15 10:30:15',
          operator: '系统'
        },
        {
          id: '3',
          action: '支付完成',
          description: '支付成功，交易号：ALI-2024-001-XYZ123',
          createdAt: '2024-01-15 10:31:00',
          operator: '系统'
        }
      ]

      setTimeout(() => {
        setPayment(mockPayment)
        setPaymentLogs(mockLogs)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取支付详情失败')
      setLoading(false)
    }
  }

  const handleRefund = async (refundReason: string) => {
    try {
      // 这里应该调用API处理退款
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/${id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          refundAmount: payment?.amount,
          refundReason
        }),
      })

      if (response.ok) {
        message.success('退款处理成功')
        setRefundModalVisible(false)
        fetchPayment()
      } else {
        throw new Error('退款处理失败')
      }
    } catch (error) {
      message.error('退款处理失败，请重试')
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Title level={3}>支付记录不存在</Title>
        <Button type="primary" onClick={() => navigate('/payments')}>
          返回支付管理
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/payments')}
            >
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              支付详情
            </Title>
          </Space>
          <Space>
            {payment.status === 'completed' && !payment.refundAmount && (
              <Button
                type="primary"
                danger
                icon={<DollarOutlined />}
                onClick={() => setRefundModalVisible(true)}
              >
                申请退款
              </Button>
            )}
          </Space>
        </div>

        <Row gutter={24}>
          <Col span={16}>
            <Descriptions
              bordered
              column={2}
              size="middle"
            >
              <Descriptions.Item label="支付ID">
                {payment.id}
              </Descriptions.Item>
              <Descriptions.Item label="订单号">
                {payment.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="用户名">
                {payment.username}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {payment.email}
              </Descriptions.Item>
              <Descriptions.Item label="支付金额">
                <Space>
                  <Tag color={getMethodColor(payment.method)}>
                    {getMethodText(payment.method)}
                  </Tag>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    {payment.currency} {payment.amount.toFixed(2)}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="支付状态">
                <Tag color={getStatusColor(payment.status)}>
                  {getStatusText(payment.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {payment.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="完成时间">
                {payment.completedAt || '-'}
              </Descriptions.Item>
              {payment.transactionId && (
                <Descriptions.Item label="交易号" span={2}>
                  {payment.transactionId}
                </Descriptions.Item>
              )}
              {payment.refundAmount && (
                <>
                  <Descriptions.Item label="退款金额">
                    <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                      {payment.currency} {payment.refundAmount.toFixed(2)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="退款时间">
                    {payment.refundAt}
                  </Descriptions.Item>
                </>
              )}
              {payment.refundReason && (
                <Descriptions.Item label="退款原因" span={2}>
                  {payment.refundReason}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="订单描述" span={2}>
                {payment.description}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={8}>
            <Card title="支付日志" size="small">
              <Timeline
                items={paymentLogs.map(log => ({
                  children: (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{log.action}</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {log.description}
                      </div>
                      <div style={{ color: '#999', fontSize: '11px' }}>
                        {log.createdAt} - {log.operator}
                      </div>
                    </div>
                  )
                }))}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Modal
        title="申请退款"
        open={refundModalVisible}
        onOk={() => {
          Modal.confirm({
            title: '确认退款',
            icon: <ExclamationCircleOutlined />,
            content: (
              <div>
                <p>订单号：{payment.orderId}</p>
                <p>退款金额：{payment.currency} {payment.amount.toFixed(2)}</p>
                <p>确定要处理这笔退款吗？</p>
              </div>
            ),
            onOk: () => handleRefund('用户申请退款'),
            okText: '确认退款',
            cancelText: '取消'
          })
        }}
        onCancel={() => setRefundModalVisible(false)}
      >
        <p>
          <strong>订单信息：</strong>
        </p>
        <p>订单号：{payment.orderId}</p>
        <p>商品：{payment.description}</p>
        <p>金额：{payment.currency} {payment.amount.toFixed(2)}</p>
        <p style={{ color: '#ff4d4f', marginTop: '16px' }}>
          <ExclamationCircleOutlined /> 退款将原路返回到用户的支付账户
        </p>
      </Modal>
    </div>
  )
}

export default PaymentDetail