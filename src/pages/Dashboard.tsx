/**
 * 仪表板页面
 */

import { useEffect } from 'react'
import { Card, Typography, Row, Col, Statistic, Progress, Table, Tag, Space } from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  RiseOutlined,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

function Dashboard() {
  useEffect(() => {
    console.log('🎯 仪表板组件已挂载')
  }, [])

  // 模拟最近订单数据
  const recentOrders = [
    {
      key: '1',
      id: 'ORD-2025-001',
      customer: '张三',
      amount: 299.00,
      status: 'completed',
      date: '2025-10-21',
      product: '月度会员订阅'
    },
    {
      key: '2',
      id: 'ORD-2025-002',
      customer: '李四',
      amount: 599.00,
      status: 'processing',
      date: '2025-10-21',
      product: '年度会员订阅'
    },
    {
      key: '3',
      id: 'ORD-2025-003',
      customer: '王五',
      amount: 199.00,
      status: 'pending',
      date: '2025-10-21',
      product: '季度会员订阅'
    },
    {
      key: '4',
      id: 'ORD-2025-004',
      customer: '赵六',
      amount: 899.00,
      status: 'completed',
      date: '2025-10-20',
      product: '终身会员订阅'
    }
  ]

  const orderColumns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '产品',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          completed: { color: 'success', text: '已完成' },
          processing: { color: 'processing', text: '处理中' },
          pending: { color: 'warning', text: '待处理' }
        }
        const config = statusMap[status as keyof typeof statusMap]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    }
  ]

  return (
    <>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          🎯 仪表板概览
        </Title>
        <Text type="secondary">
          欢迎回来，这里是万象生活管理系统的数据总览
        </Text>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={3264}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#6366F1' }}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>+12%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={89}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#10B981' }}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>+5.3%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={15860}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#F59E0B' }}
              suffix={<span style={{ fontSize: '14px', color: '#8c8c8c' }}>+8.2%</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃率"
              value={78.5}
              precision={1}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#EF4444' }}
              suffix={
                <span>
                  %<span style={{ marginLeft: '8px', fontSize: '14px', color: '#8c8c8c' }}>+2.1%</span>
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 业务进度和最近订单 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="📈 业务进度" style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>月度目标完成度</Text>
                  <Text>76%</Text>
                </div>
                <Progress percent={76} strokeColor="#6366F1" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>用户增长目标</Text>
                  <Text>82%</Text>
                </div>
                <Progress percent={82} strokeColor="#10B981" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>收入目标</Text>
                  <Text>65%</Text>
                </div>
                <Progress percent={65} strokeColor="#F59E0B" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>客户满意度</Text>
                  <Text>91%</Text>
                </div>
                <Progress percent={91} strokeColor="#EF4444" />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="🛒 最近订单" style={{ height: '100%' }}>
            <Table
              dataSource={recentOrders}
              columns={orderColumns}
              pagination={false}
              size="small"
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="⚡ 快捷操作">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <UserOutlined style={{ fontSize: '32px', color: '#6366F1', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>用户管理</Title>
                  <Text type="secondary">添加、编辑和管理用户</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <FileTextOutlined style={{ fontSize: '32px', color: '#10B981', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>任务管理</Title>
                  <Text type="secondary">创建和分配任务</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <CreditCardOutlined style={{ fontSize: '32px', color: '#F59E0B', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>支付管理</Title>
                  <Text type="secondary">查看支付记录</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  bodyStyle={{ padding: '20px' }}
                >
                  <RiseOutlined style={{ fontSize: '32px', color: '#EF4444', marginBottom: '12px' }} />
                  <Title level={5} style={{ margin: 0 }}>数据报表</Title>
                  <Text type="secondary">查看详细统计</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Dashboard