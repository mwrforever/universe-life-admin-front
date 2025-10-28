/**
 * 数据报表页面
 */

import { useEffect } from 'react'
import { Card, Typography, Row, Col, Select, DatePicker, Button, Space, Table, Progress } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface ReportData {
  period: string
  revenue: number
  users: number
  orders: number
  growthRate: number
  conversionRate: number
}

interface TopProduct {
  rank: number
  name: string
  sales: number
  revenue: number
  growth: number
}

function Reports() {
  useEffect(() => {
    console.log('📊 数据报表组件已挂载')
  }, [])

  // 模拟报表数据
  const reportData: ReportData[] = [
    {
      period: '2025-10-21',
      revenue: 15860,
      users: 128,
      orders: 89,
      growthRate: 12.5,
      conversionRate: 69.5
    },
    {
      period: '2025-10-20',
      revenue: 14230,
      users: 115,
      orders: 78,
      growthRate: 8.3,
      conversionRate: 67.8
    },
    {
      period: '2025-10-19',
      revenue: 16890,
      users: 142,
      orders: 95,
      growthRate: 15.2,
      conversionRate: 66.9
    },
    {
      period: '2025-10-18',
      revenue: 13240,
      users: 108,
      orders: 72,
      growthRate: 5.8,
      conversionRate: 66.7
    }
  ]

  const topProducts: TopProduct[] = [
    {
      rank: 1,
      name: '年度会员订阅',
      sales: 156,
      revenue: 93444,
      growth: 12.5
    },
    {
      rank: 2,
      name: '月度会员订阅',
      sales: 289,
      revenue: 86411,
      growth: 8.3
    },
    {
      rank: 3,
      name: '季度会员订阅',
      sales: 98,
      revenue: 19502,
      growth: -2.1
    },
    {
      rank: 4,
      name: '终身会员订阅',
      sales: 12,
      revenue: 10788,
      growth: 25.0
    }
  ]

  const reportColumns: ColumnsType<ReportData> = [
    {
      title: '日期',
      dataIndex: 'period',
      key: 'period'
    },
    {
      title: '营业收入',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => (
        <span style={{ color: '#0052D9', fontWeight: 600 }}>
          ¥{value.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: '新增用户',
      dataIndex: 'users',
      key: 'users',
      render: (value: number) => (
        <span style={{ color: '#07C160' }}>
          {value} 人
        </span>
      )
    },
    {
      title: '订单数量',
      dataIndex: 'orders',
      key: 'orders',
      render: (value: number) => (
        <span style={{ color: '#FF9F00' }}>
          {value} 笔
        </span>
      )
    },
    {
      title: '增长率',
      dataIndex: 'growthRate',
      key: 'growthRate',
      render: (value: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {value > 0 ? (
            <RiseOutlined style={{ color: '#0052D9' }} />
          ) : (
            <FallOutlined style={{ color: '#FF3B30' }} />
          )}
          <span style={{
            color: value > 0 ? '#0052D9' : '#FF3B30',
            fontWeight: 500
          }}>
            {value > 0 ? '+' : ''}{value}%
          </span>
        </div>
      )
    },
    {
      title: '转化率',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (value: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress
            percent={value}
            size="small"
            strokeColor="#0052D9"
            style={{ width: '60px' }}
          />
          <span>{value}%</span>
        </div>
      )
    }
  ]

  const productColumns: ColumnsType<TopProduct> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: number) => (
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: rank <= 3 ? '#0052D9' : '#F0F0F0',
          color: rank <= 3 ? '#FFFFFF' : '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          {rank}
        </div>
      )
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      )
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => `${sales} 笔`
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <span style={{ color: '#0052D9', fontWeight: 600 }}>
          ¥{revenue.toLocaleString()}
        </span>
      ),
      sorter: (a, b) => a.revenue - b.revenue
    },
    {
      title: '增长率',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {growth > 0 ? (
            <RiseOutlined style={{ color: '#07C160' }} />
          ) : (
            <FallOutlined style={{ color: '#FF3B30' }} />
          )}
          <span style={{
            color: growth > 0 ? '#07C160' : '#FF3B30',
            fontWeight: 500
          }}>
            {growth > 0 ? '+' : ''}{growth}%
          </span>
        </div>
      ),
      sorter: (a, b) => a.growth - b.growth
    }
  ]

  return (
    <>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          📊 数据报表
        </Title>
        <Space>
          <RangePicker placeholder={['开始日期', '结束日期']} />
          <Select defaultValue="today" style={{ width: 120 }}>
            <Select.Option value="today">今日</Select.Option>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
            <Select.Option value="quarter">本季度</Select.Option>
            <Select.Option value="year">本年</Select.Option>
          </Select>
          <Button icon={<DownloadOutlined />}>导出报表</Button>
        </Space>
      </div>

      {/* 关键指标卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">今日收入</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0052D9', marginTop: '4px' }}>
                  ¥15,860
                </div>
                <div style={{ fontSize: '12px', color: '#07C160', marginTop: '4px' }}>
                  <RiseOutlined /> +12.5%
                </div>
              </div>
              <DollarOutlined style={{ fontSize: '32px', color: '#0052D9', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">新增用户</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#07C160', marginTop: '4px' }}>
                  128
                </div>
                <div style={{ fontSize: '12px', color: '#07C160', marginTop: '4px' }}>
                  <RiseOutlined /> +8.3%
                </div>
              </div>
              <UserOutlined style={{ fontSize: '32px', color: '#07C160', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">订单数量</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9F00', marginTop: '4px' }}>
                  89
                </div>
                <div style={{ fontSize: '12px', color: '#FF3B30', marginTop: '4px' }}>
                  <FallOutlined /> -2.1%
                </div>
              </div>
              <BarChartOutlined style={{ fontSize: '32px', color: '#FF9F00', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary">转化率</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#86909C', marginTop: '4px' }}>
                  69.5%
                </div>
                <div style={{ fontSize: '12px', color: '#07C160', marginTop: '4px' }}>
                  <RiseOutlined /> +1.2%
                </div>
              </div>
              <LineChartOutlined style={{ fontSize: '32px', color: '#86909C', opacity: 0.3 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表和数据表格区域 */}
      <Row gutter={[24, 24]}>
        {/* 收入趋势图表 */}
        <Col xs={24} lg={16}>
          <Card title="📈 收入趋势" style={{ height: '400px' }}>
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8F9FA',
              borderRadius: '8px',
              border: '1px dashed #D9D9D9'
            }}>
              <div style={{ textAlign: 'center', color: '#8C8C8C' }}>
                <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>收入趋势图表</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>集成 ECharts 后显示</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 产品销量排行 */}
        <Col xs={24} lg={8}>
          <Card title="🏆 产品销量排行" style={{ height: '400px' }}>
            <Table
              columns={productColumns}
              dataSource={topProducts}
              pagination={false}
              size="small"
              scroll={{ y: 280 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细数据表格 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="📋 详细数据" extra={
            <Button type="link" size="small" icon={<EyeOutlined />}>
              查看更多
            </Button>
          }>
            <Table
              columns={reportColumns}
              dataSource={reportData}
              pagination={{
                total: reportData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Reports