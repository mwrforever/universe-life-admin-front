/**
 * 我的任务页面 - 当前用户相关的任务
 */

import React, { useState } from 'react'
import { Card, Button, Space, Table, Tag, Input, Select, DatePicker, Tabs, Statistic, Row, Col, Progress } from 'antd'
import { SearchOutlined, EyeOutlined, EditOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input
const { TabPane } = Tabs

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  creator: string
  createdAt: string
  dueDate: string
  progress: number
}

const MyTasks: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [myAssignedTasks, setMyAssignedTasks] = useState<Task[]>([])
  const [myCreatedTasks, setMyCreatedTasks] = useState<Task[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('assigned')
  const navigate = useNavigate()

  // 模拟数据 - 分配给我的任务
  const mockAssignedTasks: Task[] = [
    {
      id: '1',
      title: '完成登录功能',
      description: '实现用户登录和JWT认证',
      status: 'in_progress',
      priority: 'high',
      assignee: '当前用户',
      creator: '李四',
      createdAt: '2024-01-15',
      dueDate: '2024-01-20',
      progress: 75
    },
    {
      id: '2',
      title: '优化数据库查询',
      description: '优化用户查询接口性能',
      status: 'pending',
      priority: 'medium',
      assignee: '当前用户',
      creator: '王五',
      createdAt: '2024-01-16',
      dueDate: '2024-01-25',
      progress: 0
    },
    {
      id: '3',
      title: '编写API文档',
      description: '为新接口编写详细的技术文档',
      status: 'completed',
      priority: 'low',
      assignee: '当前用户',
      creator: '赵六',
      createdAt: '2024-01-10',
      dueDate: '2024-01-15',
      progress: 100
    }
  ]

  // 模拟数据 - 我创建的任务
  const mockCreatedTasks: Task[] = [
    {
      id: '4',
      title: '设计新UI组件',
      description: '为聊天室设计新的UI界面',
      status: 'in_progress',
      priority: 'high',
      assignee: '设计师小王',
      creator: '当前用户',
      createdAt: '2024-01-17',
      dueDate: '2024-01-30',
      progress: 60
    },
    {
      id: '5',
      title: '性能测试',
      description: '对系统进行全面的性能测试',
      status: 'pending',
      priority: 'medium',
      assignee: '测试工程师',
      creator: '当前用户',
      createdAt: '2024-01-18',
      dueDate: '2024-02-05',
      progress: 0
    }
  ]

  React.useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    // 这里应该调用API获取任务列表
    setTimeout(() => {
      setMyAssignedTasks(mockAssignedTasks)
      setMyCreatedTasks(mockCreatedTasks)
      setLoading(false)
    }, 500)
  }

  const handleView = (id: string) => {
    navigate(`/tasks/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/tasks/${id}/edit`)
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    }
    return colors[priority as keyof typeof colors] || 'default'
  }

  const getPriorityText = (priority: string) => {
    const texts = {
      low: '低',
      medium: '中',
      high: '高'
    }
    return texts[priority as keyof typeof texts] || priority
  }

  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const getTaskStats = (tasks: Task[]) => {
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'completed').length
    const inProgress = tasks.filter(task => task.status === 'in_progress').length
    const pending = tasks.filter(task => task.status === 'pending').length
    const overdue = tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      const today = new Date()
      return dueDate < today && task.status !== 'completed'
    }).length

    return { total, completed, inProgress, pending, overdue }
  }

  const columns: ColumnsType<Task> = [
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <a onClick={() => handleView(record.id)} style={{ color: '#1890ff', cursor: 'pointer' }}>
          {text}
        </a>
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
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: activeTab === 'assigned' ? '创建者' : '负责人',
      dataIndex: activeTab === 'assigned' ? 'creator' : 'assignee',
      key: activeTab === 'assigned' ? 'creator' : 'assignee',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: Task) => {
        const dueDate = new Date(date)
        const today = new Date()
        const isOverdue = dueDate < today && record.status !== 'completed'

        return (
          <Space>
            <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : undefined }} />
            <span style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
              {date}
            </span>
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            查看
          </Button>
          {record.assignee === '当前用户' && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            >
              编辑
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const assignedStats = getTaskStats(myAssignedTasks)
  const createdStats = getTaskStats(myCreatedTasks)

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2} style={{ margin: 0, marginBottom: '24px' }}>
          我的任务
        </Title>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Statistic
              title="总任务数"
              value={activeTab === 'assigned' ? assignedStats.total : createdStats.total}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已完成"
              value={activeTab === 'assigned' ? assignedStats.completed : createdStats.completed}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="进行中"
              value={activeTab === 'assigned' ? assignedStats.inProgress : createdStats.inProgress}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="待处理"
              value={activeTab === 'assigned' ? assignedStats.pending : createdStats.pending}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`分配给我 (${assignedStats.total})`} key="assigned">
            <Space style={{ marginBottom: '16px' }}>
              <Search
                placeholder="搜索任务标题或描述"
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
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
              </Select>
              <Select
                placeholder="优先级筛选"
                style={{ width: 120 }}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
              >
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="low">低</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="high">高</Select.Option>
              </Select>
            </Space>

            <Table
              columns={columns}
              dataSource={filterTasks(myAssignedTasks)}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filterTasks(myAssignedTasks).length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
            />
          </TabPane>

          <TabPane tab={`我创建的 (${createdStats.total})`} key="created">
            <Space style={{ marginBottom: '16px' }}>
              <Search
                placeholder="搜索任务标题或描述"
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
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
              </Select>
              <Select
                placeholder="优先级筛选"
                style={{ width: 120 }}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
              >
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="low">低</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="high">高</Select.Option>
              </Select>
            </Space>

            <Table
              columns={columns}
              dataSource={filterTasks(myCreatedTasks)}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filterTasks(myCreatedTasks).length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default MyTasks