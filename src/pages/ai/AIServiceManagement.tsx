/**
 * AI服务管理页面
 */

import React, { useState } from 'react'
import { Card, Button, Space, Table, Tag, Input, Select, Switch, Modal, message, Statistic, Row, Col, Progress } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input

interface AIService {
  id: string
  name: string
  type: 'chatbot' | 'image_generation' | 'text_analysis' | 'voice_synthesis' | 'recommendation'
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  version: string
  description: string
  apiEndpoint: string
  requests: number
  successRate: number
  avgResponseTime: number
  cost: number
  createdAt: string
  updatedAt: string
}

const AIServiceManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<AIService[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const navigate = useNavigate()

  // 模拟数据
  const mockServices: AIService[] = [
    {
      id: '1',
      name: '智能客服机器人',
      type: 'chatbot',
      status: 'active',
      version: 'v2.1.0',
      description: '基于大语言模型的智能客服系统，支持多轮对话和上下文理解',
      apiEndpoint: '/api/ai/chatbot',
      requests: 15420,
      successRate: 98.5,
      avgResponseTime: 1200,
      cost: 299.99,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: '图像生成服务',
      type: 'image_generation',
      status: 'active',
      version: 'v1.5.2',
      description: 'AI图像生成服务，支持文生图和图像编辑功能',
      apiEndpoint: '/api/ai/image-gen',
      requests: 8930,
      successRate: 96.2,
      avgResponseTime: 3500,
      cost: 499.99,
      createdAt: '2024-01-12',
      updatedAt: '2024-01-19'
    },
    {
      id: '3',
      name: '文本分析引擎',
      type: 'text_analysis',
      status: 'maintenance',
      version: 'v3.0.1',
      description: '自然语言处理服务，支持情感分析、关键词提取等',
      apiEndpoint: '/api/ai/text-analysis',
      requests: 23100,
      successRate: 99.1,
      avgResponseTime: 800,
      cost: 199.99,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-18'
    },
    {
      id: '4',
      name: '语音合成服务',
      type: 'voice_synthesis',
      status: 'inactive',
      version: 'v1.2.0',
      description: '高质量语音合成服务，支持多种音色和语言',
      apiEndpoint: '/api/ai/tts',
      requests: 5600,
      successRate: 97.8,
      avgResponseTime: 2000,
      cost: 399.99,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-17'
    },
    {
      id: '5',
      name: '推荐系统引擎',
      type: 'recommendation',
      status: 'error',
      version: 'v2.0.3',
      description: '个性化推荐算法，支持商品、内容等多场景推荐',
      apiEndpoint: '/api/ai/recommend',
      requests: 42100,
      successRate: 94.5,
      avgResponseTime: 1500,
      cost: 599.99,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-16'
    }
  ]

  React.useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    // 这里应该调用API获取AI服务列表
    setTimeout(() => {
      setServices(mockServices)
      setLoading(false)
    }, 500)
  }

  const handleEdit = (id: string) => {
    navigate(`/ai/${id}/edit`)
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个AI服务吗？此操作不可恢复。',
      onOk: async () => {
        try {
          // 这里应该调用API删除服务
          message.success('服务删除成功')
          fetchServices()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      // 这里应该调用API切换服务状态
      message.success(`服务已${newStatus === 'active' ? '启用' : '停用'}`)
      fetchServices()
    } catch (error) {
      message.error('状态切换失败')
    }
  }

  const handleTest = async (id: string) => {
    message.info('测试功能开发中...')
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'green',
      inactive: 'default',
      maintenance: 'orange',
      error: 'red'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const texts = {
      active: '运行中',
      inactive: '已停止',
      maintenance: '维护中',
      error: '错误'
    }
    return texts[status as keyof typeof texts] || status
  }

  const getTypeColor = (type: string) => {
    const colors = {
      chatbot: 'blue',
      image_generation: 'purple',
      text_analysis: 'green',
      voice_synthesis: 'orange',
      recommendation: 'red'
    }
    return colors[type as keyof typeof colors] || 'default'
  }

  const getTypeText = (type: string) => {
    const texts = {
      chatbot: '聊天机器人',
      image_generation: '图像生成',
      text_analysis: '文本分析',
      voice_synthesis: '语音合成',
      recommendation: '推荐系统'
    }
    return texts[type as keyof typeof texts] || type
  }

  const getServiceStats = () => {
    const total = services.length
    const active = services.filter(s => s.status === 'active').length
    const totalRequests = services.reduce((sum, service) => sum + service.requests, 0)
    const avgSuccessRate = services.length > 0
      ? services.reduce((sum, service) => sum + service.successRate, 0) / services.length
      : 0
    const totalCost = services.reduce((sum, service) => sum + service.cost, 0)

    return { total, active, totalRequests, avgSuccessRate, totalCost }
  }

  const stats = getServiceStats()

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter
    const matchesType = typeFilter === 'all' || service.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const columns: ColumnsType<AIService> = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AIService) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.version}</div>
        </div>
      ),
    },
    {
      title: '服务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>
          {getTypeText(type)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: AIService) => (
        <Space>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          <Switch
            size="small"
            checked={status === 'active'}
            onChange={() => handleToggleStatus(record.id, status)}
            disabled={status === 'maintenance' || status === 'error'}
          />
        </Space>
      ),
    },
    {
      title: '请求数',
      dataIndex: 'requests',
      key: 'requests',
      render: (requests: number) => requests.toLocaleString(),
      sorter: (a, b) => a.requests - b.requests,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 95 ? 'success' : rate >= 90 ? 'active' : 'exception'}
          format={() => `${rate}%`}
        />
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
    {
      title: '响应时间',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      render: (time: number) => `${time}ms`,
      sorter: (a, b) => a.avgResponseTime - b.avgResponseTime,
    },
    {
      title: '月费用',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          ¥{cost.toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleTest(record.id)}
          >
            测试
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0, marginBottom: '24px' }}>
            AI服务管理
          </Title>

          {/* 统计卡片 */}
          <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={6}>
              <Statistic
                title="服务总数"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="运行中"
                value={stats.active}
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总请求数"
                value={stats.totalRequests}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="平均成功率"
                value={stats.avgSuccessRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#eb2f96' }}
              />
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Space>
              <Search
                placeholder="搜索服务名称或描述"
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
                <Select.Option value="active">运行中</Select.Option>
                <Select.Option value="inactive">已停止</Select.Option>
                <Select.Option value="maintenance">维护中</Select.Option>
                <Select.Option value="error">错误</Select.Option>
              </Select>
              <Select
                placeholder="类型筛选"
                style={{ width: 140 }}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value)}
              >
                <Select.Option value="all">全部类型</Select.Option>
                <Select.Option value="chatbot">聊天机器人</Select.Option>
                <Select.Option value="image_generation">图像生成</Select.Option>
                <Select.Option value="text_analysis">文本分析</Select.Option>
                <Select.Option value="voice_synthesis">语音合成</Select.Option>
                <Select.Option value="recommendation">推荐系统</Select.Option>
              </Select>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/ai/create')}
            >
              新增服务
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredServices.length,
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

export default AIServiceManagement