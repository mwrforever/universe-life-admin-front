/**
 * 任务管理页面
 */

import React, { useEffect } from 'react'
import { Card, Typography, Table, Tag, Space, Button, Input, Select, Avatar, Row, Col, Statistic, Modal, Form, message, Progress, DatePicker } from 'antd'
import {
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input
const { RangePicker } = DatePicker

interface Task {
  key: string
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigneeId: string
  assigneeName: string
  assigneeAvatar?: string
  creatorId: string
  creatorName: string
  createTime: string
  deadline?: string
  completeTime?: string
  progress: number
  tags: string[]
}

function Tasks() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(false)
  const [editModalVisible, setEditModalVisible] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    console.log('📋 任务管理组件已挂载')
    // 初始化模拟数据
    setTasks([
      {
        key: '1',
        id: 'TSK-2025-001',
        title: '优化数据库查询性能',
        description: '对用户查询接口进行优化，提升响应速度',
        priority: 'high',
        status: 'in_progress',
        assigneeId: 'USR-001',
        assigneeName: '张三',
        creatorId: 'USR-002',
        creatorName: '李四',
        createTime: '2025-10-18 09:00:00',
        deadline: '2025-10-25 18:00:00',
        progress: 65,
        tags: ['技术', '后端', '优化']
      },
      {
        key: '2',
        id: 'TSK-2025-002',
        title: '设计新版用户界面',
        description: '根据用户反馈重新设计管理后台界面',
        priority: 'medium',
        status: 'pending',
        assigneeId: 'USR-003',
        assigneeName: '王五',
        creatorId: 'USR-002',
        creatorName: '李四',
        createTime: '2025-10-19 14:30:00',
        deadline: '2025-10-28 18:00:00',
        progress: 0,
        tags: ['设计', '前端', 'UI']
      },
      {
        key: '3',
        id: 'TSK-2025-003',
        title: '编写API文档',
        description: '为新版API接口编写详细的技术文档',
        priority: 'low',
        status: 'completed',
        assigneeId: 'USR-004',
        assigneeName: '赵六',
        creatorId: 'USR-001',
        creatorName: '张三',
        createTime: '2025-10-15 10:15:00',
        deadline: '2025-10-20 18:00:00',
        completeTime: '2025-10-19 16:45:00',
        progress: 100,
        tags: ['文档', '技术']
      },
      {
        key: '4',
        id: 'TSK-2025-004',
        title: '修复支付接口Bug',
        description: '修复微信支付回调处理异常的问题',
        priority: 'high',
        status: 'in_progress',
        assigneeId: 'USR-001',
        assigneeName: '张三',
        creatorId: 'USR-003',
        creatorName: '王五',
        createTime: '2025-10-20 16:20:00',
        deadline: '2025-10-22 12:00:00',
        progress: 30,
        tags: ['Bug修复', '支付', '紧急']
      }
    ])
  }, [])

  const columns: ColumnsType<Task> = [
    {
      title: '任务信息',
      key: 'taskInfo',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>
            {record.title}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '6px' }}>
            {record.id} • 创建于 {record.createTime}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {record.tags.map(tag => (
              <Tag key={tag} color="blue" style={{ fontSize: '12px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityMap = {
          high: { color: 'error', text: '高', icon: <FlagOutlined /> },
          medium: { color: 'warning', text: '中', icon: <FlagOutlined /> },
          low: { color: 'default', text: '低', icon: <FlagOutlined /> }
        }
        const config = priorityMap[priority as keyof typeof priorityMap]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'default', text: '待处理', icon: <ClockCircleOutlined /> },
          in_progress: { color: 'processing', text: '进行中', icon: <ClockCircleOutlined /> },
          completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
          cancelled: { color: 'error', text: '已取消', icon: <ExclamationCircleOutlined /> }
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
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div style={{ width: '100px' }}>
          <Progress
            percent={progress}
            size="small"
            strokeColor={progress === 100 ? '#07C160' : '#0052D9'}
          />
        </div>
      )
    },
    {
      title: '负责人',
      key: 'assignee',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar
            size="small"
            src={record.assigneeAvatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#0052D9' }}
          />
          <span>{record.assigneeName}</span>
        </div>
      )
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline?: string) => {
        if (!deadline) return <span style={{ color: '#8c8c8c' }}>无截止时间</span>

        const deadlineDate = new Date(deadline)
        const now = new Date()
        const isOverdue = deadlineDate < now

        return (
          <div style={{ color: isOverdue ? '#FF3B30' : '#000' }}>
            <div style={{ fontSize: '13px' }}>{deadline}</div>
            {isOverdue && (
              <div style={{ fontSize: '11px', color: '#FF3B30' }}>
                已逾期
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status !== 'completed' && (
            <Button type="link" size="small" style={{ color: '#07C160' }}>
              {record.status === 'pending' ? '开始' : '完成'}
            </Button>
          )}
        </Space>
      )
    }
  ]

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    form.setFieldsValue(task)
    setEditModalVisible(true)
  }

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('任务信息更新成功！')
      setEditModalVisible(false)
      // 实际更新逻辑
    } catch (error) {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          📋 任务管理
        </Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={156}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#0052D9' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中"
              value={28}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#FF9F00' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成"
              value={89}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#07C160' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期任务"
              value={5}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#FF3B30' }}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* 任务列表 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              任务列表
            </Title>
          </div>
          <Space>
            <Search
              placeholder="搜索任务标题、描述..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部优先级</Select.Option>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Button type="primary" icon={<PlusOutlined />}>
              创建任务
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
          pagination={{
            total: tasks.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑任务模态框 */}
      <Modal
        title="编辑任务信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item label="任务标题" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="任务描述" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="优先级" name="priority">
                <Select>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="medium">中</Select.Option>
                  <Select.Option value="low">低</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status">
                <Select>
                  <Select.Option value="pending">待处理</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="负责人" name="assigneeName">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止时间" name="deadline">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="进度 (%)" name="progress">
            <Input type="number" min={0} max={100} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Tasks