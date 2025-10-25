/**
 * 仪表板页面
 *
 * 包含Socket.IO聊天的快捷入口和系统概览
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Button, Typography, Space, Badge } from 'antd'
import {
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  RocketOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // 模拟统计数据
  const stats = {
    totalMessages: 1247,
    activeUsers: 89,
    totalRooms: 12,
    systemUptime: '99.9%'
  }

  const handleGoToChat = () => {
    navigate('/chat')
  }

  const handleGoToSocketIOChat = () => {
    // 直接打开Socket.IO聊天组件
    navigate('/chat/general')
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>系统仪表板</Title>
        <Text type="secondary">欢迎使用Socket.IO高并发聊天系统</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总消息数"
              value={stats.totalMessages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="聊天室数量"
              value={stats.totalRooms}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="系统运行时间"
              value={stats.systemUptime}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="Socket.IO 实时聊天"
            extra={<Badge status="processing" text="在线" />}
            actions={[
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={handleGoToSocketIOChat}
                block
              >
                进入聊天室
              </Button>
            ]}
          >
            <div>
              <Text>基于Socket.IO的高并发实时聊天系统</Text>
              <div style={{ marginTop: '12px' }}>
                <Space>
                  <Badge status="success" text="WebSocket连接" />
                  <Badge status="success" text="实时消息" />
                  <Badge status="processing" text="房间管理" />
                </Space>
              </div>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  支持1000+并发用户，消息延迟 &lt; 100ms
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="聊天室管理"
            extra={<Badge status="default" text="管理" />}
            actions={[
              <Button
                icon={<TeamOutlined />}
                onClick={handleGoToChat}
                block
              >
                查看所有聊天室
              </Button>
            ]}
          >
            <div>
              <Text>管理和查看所有聊天室</Text>
              <div style={{ marginTop: '12px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>公共聊天室</Text>
                    <Badge count={156} style={{ float: 'right' }} />
                  </div>
                  <div>
                    <Text strong>技术交流</Text>
                    <Badge count={89} style={{ float: 'right' }} />
                  </div>
                  <div>
                    <Text strong>随机聊天</Text>
                    <Badge count={234} style={{ float: 'right' }} />
                  </div>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="系统监控"
            extra={<Badge status="warning" text="监控中" />}
            actions={[
              <Button
                icon={<BarChartOutlined />}
                block
              >
                查看详细监控
              </Button>
            ]}
          >
            <div>
              <Text>实时系统性能监控</Text>
              <div style={{ marginTop: '12px' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>CPU使用率</Text>
                    <Text type="success">45%</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>内存使用率</Text>
                    <Text type="warning">67%</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>网络延迟</Text>
                    <Text type="success">23ms</Text>
                  </div>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="快速操作"
            extra={<RocketOutlined />}
            actions={[
              <Button type="dashed" block>
                系统设置
              </Button>
            ]}
          >
            <div>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block>创建新聊天室</Button>
                <Button block>邀请用户</Button>
                <Button block>导出聊天记录</Button>
                <Button block>系统重启</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard