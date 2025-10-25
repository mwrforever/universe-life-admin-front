/**
 * 聊天管理页面
 */

import React, { useEffect } from 'react'
import { Card, Typography, Table, Tag, Space, Button, Input, Select, Row, Col, Statistic, Badge, Avatar } from 'antd'
import {
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  SendOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input

interface ChatSession {
  key: string
  id: string
  userId: string
  userName: string
  userAvatar?: string
  lastMessage: string
  messageCount: number
  status: 'active' | 'paused' | 'ended'
  priority: 'high' | 'medium' | 'low'
  startTime: string
  lastActiveTime: string
  assignedAgent?: string
}

function Chat() {
  useEffect(() => {
    console.log('💬 聊天管理组件已挂载')
  }, [])

  // 模拟聊天会话数据
  const chatData: ChatSession[] = [
    {
      key: '1',
      id: 'CHAT-2025-001',
      userId: 'USR-001',
      userName: '张三',
      lastMessage: '请问会员续费有什么优惠吗？',
      messageCount: 12,
      status: 'active',
      priority: 'high',
      startTime: '2025-10-21 10:30:00',
      lastActiveTime: '2025-10-21 14:25:00',
      assignedAgent: '客服小美'
    },
    {
      key: '2',
      id: 'CHAT-2025-002',
      userId: 'USR-002',
      userName: '李四',
      lastMessage: '好的，谢谢你的帮助',
      messageCount: 8,
      status: 'paused',
      priority: 'medium',
      startTime: '2025-10-21 11:15:00',
      lastActiveTime: '2025-10-21 13:20:00',
      assignedAgent: '客服小王'
    },
    {
      key: '3',
      id: 'CHAT-2025-003',
      userId: 'USR-003',
      userName: '王五',
      lastMessage: '我想了解一下产品功能',
      messageCount: 3,
      status: 'active',
      priority: 'low',
      startTime: '2025-10-21 12:20:00',
      lastActiveTime: '2025-10-21 14:18:00'
    },
    {
      key: '4',
      id: 'CHAT-2025-004',
      userId: 'USR-004',
      userName: '赵六',
      lastMessage: '问题已解决，感谢支持',
      messageCount: 15,
      status: 'ended',
      priority: 'medium',
      startTime: '2025-10-21 09:45:00',
      lastActiveTime: '2025-10-21 12:30:00',
      assignedAgent: '客服小李'
    }
  ]

  const columns: ColumnsType<ChatSession> = [
    {
      title: '会话信息',
      key: 'sessionInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge
            status={record.status === 'active' ? 'processing' : record.status === 'paused' ? 'warning' : 'default'}
            dot
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#0052D9' }}
            />
          </Badge>
          <div>
            <div style={{ fontWeight: 500 }}>{record.userName}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.id}</div>
          </div>
        </div>
      )
    },
    {
      title: '最后消息',
      dataIndex: 'lastMessage',
      key: 'lastMessage',
      render: (text: string) => (
        <div style={{ maxWidth: '200px' }} title={text}>
          {text.length > 20 ? `${text.substring(0, 20)}...` : text}
        </div>
      )
    },
    {
      title: '消息数量',
      dataIndex: 'messageCount',
      key: 'messageCount',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#0052D9' }} />
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityMap = {
          high: { color: 'error', text: '高' },
          medium: { color: 'warning', text: '中' },
          low: { color: 'default', text: '低' }
        }
        const config = priorityMap[priority as keyof typeof priorityMap]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
          paused: { color: 'warning', text: '暂停', icon: <PauseCircleOutlined /> },
          ended: { color: 'default', text: '已结束', icon: <CheckCircleOutlined /> }
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
      title: '客服',
      dataIndex: 'assignedAgent',
      key: 'assignedAgent',
      render: (agent?: string) => (
        <div>
          {agent ? (
            <Tag color="blue">{agent}</Tag>
          ) : (
            <Tag color="default">未分配</Tag>
          )}
        </div>
      )
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveTime',
      key: 'lastActiveTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看详情
          </Button>
          {record.status === 'active' && (
            <Button type="link" size="small" icon={<SendOutlined />} style={{ color: '#0052D9' }}>
              接入
            </Button>
          )}
          {record.status === 'paused' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />} style={{ color: '#07C160' }}>
              继续
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
          💬 聊天管理
        </Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会话"
              value={28}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#0052D9' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="等待响应"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#FF9F00' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日消息"
              value={342}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#07C160' }}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均响应时间"
              value={1.2}
              precision={1}
              suffix="分钟"
              valueStyle={{ color: '#86909C' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 聊天会话表格 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              聊天会话
            </Title>
          </div>
          <Space>
            <Search
              placeholder="搜索用户、会话ID..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="paused">暂停</Select.Option>
              <Select.Option value="ended">已结束</Select.Option>
            </Select>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部优先级</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
            <Button type="primary" icon={<MessageOutlined />}>
              新建会话
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={chatData}
          pagination={{
            total: chatData.length,
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

export default Chat