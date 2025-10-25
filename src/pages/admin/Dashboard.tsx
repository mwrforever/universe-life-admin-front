/**
 * 万象生活仪表板页面
 * 生活化数据展示 + 温暖专业设计
 */

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Table, Tag, Progress, Space, Button, Select, DatePicker, Flex } from 'antd'
import { WanXiangIcon } from '@/components/icons'
import type { ColumnsType } from 'antd/es/table'
import { Line, Column } from '@ant-design/plots'
import { MessageOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalRevenue: number
  todayMessages: number
  onlineUsers: number
}

interface RecentActivity {
  id: string
  type: 'user' | 'order' | 'payment' | 'message'
  description: string
  user: string
  time: string
  status: 'success' | 'pending' | 'error'
}

interface SystemPerformance {
  cpu: number
  memory: number
  disk: number
  network: number
}

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayMessages: 0,
    onlineUsers: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [performance, setPerformance] = useState<SystemPerformance>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  })
  const [timeRange, setTimeRange] = useState('7d')

  // 模拟数据
  const mockStats: DashboardStats = {
    totalUsers: 1284,
    activeUsers: 892,
    totalOrders: 3421,
    totalRevenue: 128456.78,
    todayMessages: 5632,
    onlineUsers: 234
  }

  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user',
      description: '新用户注册',
      user: '张三',
      time: '5分钟前',
      status: 'success'
    },
    {
      id: '2',
      type: 'order',
      description: '创建了高级会员订单',
      user: '李四',
      time: '10分钟前',
      status: 'success'
    },
    {
      id: '3',
      type: 'payment',
      description: '支付订单',
      user: '王五',
      time: '15分钟前',
      status: 'success'
    },
    {
      id: '4',
      type: 'message',
      description: '发送了大量消息',
      user: '赵六',
      time: '20分钟前',
      status: 'pending'
    },
    {
      id: '5',
      type: 'user',
      description: '用户登录失败',
      user: '钱七',
      time: '25分钟前',
      status: 'error'
    }
  ]

  const mockPerformance: SystemPerformance = {
    cpu: 65,
    memory: 78,
    disk: 45,
    network: 23
  }

  // 模拟图表数据
  const chartData = [
    { date: '01-15', users: 120, orders: 45, revenue: 3200 },
    { date: '01-16', users: 135, orders: 52, revenue: 3800 },
    { date: '01-17', users: 142, orders: 48, revenue: 3500 },
    { date: '01-18', users: 158, orders: 61, revenue: 4200 },
    { date: '01-19', users: 169, orders: 55, revenue: 3900 },
    { date: '01-20', users: 175, orders: 58, revenue: 4100 },
    { date: '01-21', users: 189, orders: 63, revenue: 4500 }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 这里应该调用API获取仪表板数据
      setTimeout(() => {
        setStats(mockStats)
        setRecentActivities(mockActivities)
        setPerformance(mockPerformance)
        setLoading(false)
      }, 500)
    } catch (error) {
      setLoading(false)
    }
  }

  const getActivityTypeColor = (type: string) => {
    const colors = {
      user: 'blue',
      order: 'green',
      payment: 'orange',
      message: 'purple'
    }
    return colors[type as keyof typeof colors] || 'default'
  }

  const getActivityTypeText = (type: string) => {
    const texts = {
      user: '用户',
      order: '订单',
      payment: '支付',
      message: '消息'
    }
    return texts[type as keyof typeof texts] || type
  }

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'green',
      pending: 'orange',
      error: 'red'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const activityColumns: ColumnsType<RecentActivity> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getActivityTypeColor(type)}>
          {getActivityTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'success' ? '成功' : status === 'pending' ? '处理中' : '错误'}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ]

  // 用户增长图表配置
  const userGrowthConfig = {
    data: chartData,
    xField: 'date',
    yField: 'users',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: '用户数',
        value: datum.users,
      }),
    },
  }

  // 收入图表配置
  const revenueConfig = {
    data: chartData,
    xField: 'date',
    yField: 'revenue',
    columnWidthRatio: 0.6,
    color: '#52c41a',
    meta: {
      revenue: {
        alias: '收入',
      },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: '收入',
        value: `¥${datum.revenue}`,
      }),
    },
  }

  return (
    <div className="wan-dashboard">
      {/* 页面头部 */}
      <div className="wan-dashboard-header">
        <div className="wan-header-content">
          <Title level={2} className="wan-dashboard-title">
            欢迎回来，{user?.username || '管理员'}
          </Title>
          <p className="wan-dashboard-subtitle">
            今天是个美好的一天，让我们一起让生活更精彩
          </p>
        </div>

        <div className="wan-header-actions">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            className="wan-time-selector"
          >
            <Select.Option value="1d">今天</Select.Option>
            <Select.Option value="7d">本周</Select.Option>
            <Select.Option value="30d">本月</Select.Option>
            <Select.Option value="90d">本季</Select.Option>
          </Select>
        </div>
      </div>

      {/* 生活化统计卡片 */}
      <Row gutter={[24, 24]} className="wan-stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="wan-stat-card wan-stat-users">
            <div className="wan-stat-content">
              <div className="wan-stat-icon wan-icon-users">
                <WanXiangIcon type="User" />
              </div>
              <div className="wan-stat-info">
                <div className="wan-stat-value">{stats.totalUsers.toLocaleString()}</div>
                <div className="wan-stat-label">活跃用户</div>
                <div className="wan-stat-trend">
                  <span className="wan-trend-up">+12.5%</span>
                  <span className="wan-trend-text">较上月</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="wan-stat-card wan-stat-tasks">
            <div className="wan-stat-content">
              <div className="wan-stat-icon wan-icon-tasks">
                <WanXiangIcon type="Task" />
              </div>
              <div className="wan-stat-info">
                <div className="wan-stat-value">{stats.totalOrders.toLocaleString()}</div>
                <div className="wan-stat-label">任务总数</div>
                <div className="wan-stat-trend">
                  <span className="wan-trend-up">+8.3%</span>
                  <span className="wan-trend-text">较上月</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="wan-stat-card wan-stat-revenue">
            <div className="wan-stat-content">
              <div className="wan-stat-icon wan-icon-revenue">
                <WanXiangIcon type="Wallet" />
              </div>
              <div className="wan-stat-info">
                <div className="wan-stat-value">¥{stats.totalRevenue.toLocaleString()}</div>
                <div className="wan-stat-label">总收入</div>
                <div className="wan-stat-trend">
                  <span className="wan-trend-up">+15.7%</span>
                  <span className="wan-trend-text">较上月</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="wan-stat-card wan-stat-messages">
            <div className="wan-stat-content">
              <div className="wan-stat-icon wan-icon-messages">
                <WanXiangIcon type="Message" />
              </div>
              <div className="wan-stat-info">
                <div className="wan-stat-value">{stats.todayMessages.toLocaleString()}</div>
                <div className="wan-stat-label">今日消息</div>
                <div className="wan-stat-trend">
                  <span className="wan-trend-down">-2.1%</span>
                  <span className="wan-trend-text">较昨日</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日消息"
              value={stats.todayMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={stats.onlineUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系统性能">
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.cpu}
                    size={60}
                    strokeColor="#ff7875"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>CPU</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.memory}
                    size={60}
                    strokeColor="#ffa940"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>内存</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.disk}
                    size={60}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>磁盘</div>
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.network}
                    size={60}
                    strokeColor="#1890ff"
                  />
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>网络</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="用户增长趋势" loading={loading}>
            <Line {...userGrowthConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="收入统计" loading={loading}>
            <Column {...revenueConfig} />
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Card
        title="最近活动"
        extra={
          <Button type="text" icon={<MoreOutlined />}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={activityColumns}
          dataSource={recentActivities}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 自定义样式 */}
      <style jsx>{`
        .wan-dashboard {
          width: 100%;
          min-height: calc(100vh - 64px);
          padding: var(--wan-spacing-lg);
        }

        .wan-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--wan-spacing-xl);
          padding: var(--wan-spacing-lg);
          background: var(--wan-bg-primary);
          border-radius: var(--wan-radius-large);
          box-shadow: var(--wan-shadow-small);
        }

        .wan-header-content {
          flex: 1;
        }

        .wan-dashboard-title {
          margin-bottom: var(--wan-spacing-sm) !important;
          color: var(--wan-text-primary);
          font-weight: 600 !important;
        }

        .wan-dashboard-subtitle {
          color: var(--wan-text-secondary);
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }

        .wan-header-actions {
          display: flex;
          align-items: center;
          gap: var(--wan-spacing-md);
        }

        .wan-time-selector {
          min-width: 120px;
        }

        .wan-stats-row {
          margin-bottom: var(--wan-spacing-xl);
        }

        .wan-stat-card {
          height: 140px;
          border-radius: var(--wan-radius-large);
          border: 1px solid var(--wan-neutral-200);
          transition: all var(--wan-transition-normal);
          overflow: hidden;
          position: relative;
        }

        .wan-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--wan-shadow-large);
        }

        .wan-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--wan-primary-gradient);
        }

        .wan-stat-users::before {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .wan-stat-tasks::before {
          background: linear-gradient(90deg, #52c41a, #73d13d);
        }

        .wan-stat-revenue::before {
          background: linear-gradient(90deg, #ff9a76, #ffc3c0);
        }

        .wan-stat-messages::before {
          background: linear-gradient(90deg, #1890ff, #40a9ff);
        }

        .wan-stat-content {
          display: flex;
          align-items: center;
          height: 100%;
          padding: var(--wan-spacing-lg);
        }

        .wan-stat-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--wan-radius-large);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--wan-spacing-md);
          flex-shrink: 0;
          font-size: 24px;
          color: white;
        }

        .wan-icon-users {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .wan-icon-tasks {
          background: linear-gradient(135deg, #52c41a, #73d13d);
        }

        .wan-icon-revenue {
          background: linear-gradient(135deg, #ff9a76, #ffc3c0);
        }

        .wan-icon-messages {
          background: linear-gradient(135deg, #1890ff, #40a9ff);
        }

        .wan-stat-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .wan-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--wan-text-primary);
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .wan-stat-label {
          font-size: 14px;
          color: var(--wan-text-secondary);
          margin-bottom: 8px;
          font-weight: 500;
        }

        .wan-stat-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .wan-trend-up {
          color: var(--wan-warm-green);
          font-weight: 600;
        }

        .wan-trend-down {
          color: var(--wan-status-error);
          font-weight: 600;
        }

        .wan-trend-text {
          color: var(--wan-text-tertiary);
        }

        /* 图表卡片样式 */
        .wan-chart-card {
          border-radius: var(--wan-radius-large);
          box-shadow: var(--wan-shadow-small);
          border: 1px solid var(--wan-neutral-200);
        }

        .wan-chart-card :global(.ant-card-head) {
          border-bottom: 1px solid var(--wan-neutral-200);
          background: var(--wan-bg-secondary);
        }

        .wan-chart-card :global(.ant-card-head-title) {
          color: var(--wan-text-primary);
          font-weight: 600;
        }

        /* 活动表格样式 */
        .wan-activity-table :global(.ant-table-thead > tr > th) {
          background: var(--wan-bg-tertiary);
          color: var(--wan-text-primary);
          font-weight: 600;
        }

        .wan-activity-table :global(.ant-table-tbody > tr:hover > td) {
          background: var(--wan-primary-50);
        }

        /* 响应式设计 */
        @media (max-width: 1200px) {
          .wan-stat-value {
            font-size: 24px;
          }
        }

        @media (max-width: 992px) {
          .wan-dashboard {
            padding: var(--wan-spacing-md);
          }

          .wan-stat-content {
            padding: var(--wan-spacing-md);
          }

          .wan-stat-icon {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .wan-stat-value {
            font-size: 22px;
          }
        }

        @media (max-width: 768px) {
          .wan-dashboard {
            padding: var(--wan-spacing-sm);
          }

          .wan-dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: var(--wan-spacing-md);
          }

          .wan-header-actions {
            justify-content: flex-end;
          }

          .wan-stats-row {
            margin-bottom: var(--wan-spacing-lg);
          }

          .wan-stat-card {
            height: 120px;
            margin-bottom: var(--wan-spacing-md);
          }

          .wan-stat-content {
            padding: var(--wan-spacing-md);
          }

          .wan-stat-icon {
            width: 45px;
            height: 45px;
            font-size: 18px;
          }

          .wan-stat-value {
            font-size: 20px;
          }
        }

        @media (max-width: 576px) {
          .wan-dashboard {
            padding: var(--wan-spacing-sm);
          }

          .wan-stat-card {
            height: 100px;
          }

          .wan-stat-content {
            padding: var(--wan-spacing-sm);
          }

          .wan-stat-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
            margin-right: var(--wan-spacing-sm);
          }

          .wan-stat-value {
            font-size: 18px;
          }

          .wan-stat-label {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}

export default Dashboard