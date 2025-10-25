/**
 * 浏览任务页面 - 公开任务浏览
 */

import React, { useState } from 'react'
import { Card, Button, Space, Table, Tag, Input, Select, DatePicker, Typography, Row, Col } from 'antd'
import { SearchOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input
const { RangePicker } = DatePicker

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
  department: string
  category: string
}

const BrowseTasks: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const navigate = useNavigate()

  // 模拟数据
  const mockTasks: Task[] = [
    {
      id: '1',
      title: '完成登录功能',
      description: '实现用户登录和JWT认证',
      status: 'completed',
      priority: 'high',
      assignee: '张三',
      creator: '李四',
      createdAt: '2024-01-15',
      dueDate: '2024-01-20',
      department: '技术部',
      category: '开发'
    },
    {
      id: '2',
      title: '优化数据库查询',
      description: '优化用户查询接口性能',
      status: 'in_progress',
      priority: 'medium',
      assignee: '王五',
      creator: '李四',
      createdAt: '2024-01-16',
      dueDate: '2024-01-25',
      department: '技术部',
      category: '优化'
    },
    {
      id: '3',
      title: '设计新UI组件',
      description: '为聊天室设计新的UI界面',
      status: 'pending',
      priority: 'low',
      assignee: '赵六',
      creator: '李四',
      createdAt: '2024-01-17',
      dueDate: '2024-01-30',
      department: '设计部',
      category: '设计'
    },
    {
      id: '4',
      title: '客户需求调研',
      description: '收集和分析客户对新功能的需求',
      status: 'in_progress',
      priority: 'high',
      assignee: '钱七',
      creator: '孙八',
      createdAt: '2024-01-18',
      dueDate: '2024-01-28',
      department: '市场部',
      category: '调研'
    }
  ]

  React.useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    // 这里应该调用API获取任务列表
    setTimeout(() => {
      setTasks(mockTasks)
      setLoading(false)
    }, 500)
  }

  const handleView = (id: string) => {
    navigate(`/tasks/${id}`)
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesDepartment = departmentFilter === 'all' || task.department === departmentFilter
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesCategory
  })

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
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <Tag color="purple">{text}</Tag>
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
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {date}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleView(record.id)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0, marginBottom: '24px' }}>
            任务浏览
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索任务标题、描述或负责人"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="状态筛选"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
              >
                <Select.Option value="all">全部状态</Select.Option>
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="in_progress">进行中</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="优先级筛选"
                style={{ width: '100%' }}
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value)}
              >
                <Select.Option value="all">全部优先级</Select.Option>
                <Select.Option value="low">低</Select.Option>
                <Select.Option value="medium">中</Select.Option>
                <Select.Option value="high">高</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="部门筛选"
                style={{ width: '100%' }}
                value={departmentFilter}
                onChange={(value) => setDepartmentFilter(value)}
              >
                <Select.Option value="all">全部部门</Select.Option>
                <Select.Option value="技术部">技术部</Select.Option>
                <Select.Option value="设计部">设计部</Select.Option>
                <Select.Option value="市场部">市场部</Select.Option>
                <Select.Option value="运营部">运营部</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Select
                placeholder="分类筛选"
                style={{ width: '100%' }}
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value)}
              >
                <Select.Option value="all">全部分类</Select.Option>
                <Select.Option value="开发">开发</Select.Option>
                <Select.Option value="设计">设计</Select.Option>
                <Select.Option value="优化">优化</Select.Option>
                <Select.Option value="调研">调研</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredTasks.length,
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

export default BrowseTasks