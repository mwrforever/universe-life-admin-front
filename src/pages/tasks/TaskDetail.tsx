/**
 * 任务详情页面
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, Descriptions, Tag, Spin, Space, message, Modal } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'

const { Title } = Typography

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
  updatedAt: string
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<Task | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTask()
    }
  }, [id])

  const fetchTask = async () => {
    setLoading(true)
    try {
      // 这里应该调用API获取任务详情
      // 模拟数据
      const mockTask: Task = {
        id: id || '1',
        title: '完成登录功能',
        description: '实现用户登录和JWT认证功能，包括前端登录表单、后端API接口、token验证等功能模块',
        status: 'in_progress',
        priority: 'high',
        assignee: '张三',
        creator: '李四',
        createdAt: '2024-01-15 09:00:00',
        dueDate: '2024-01-20',
        updatedAt: '2024-01-16 14:30:00'
      }

      setTimeout(() => {
        setTask(mockTask)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取任务详情失败')
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/tasks/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      // 这里应该调用API删除任务
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      })

      if (response.ok) {
        message.success('任务删除成功')
        navigate('/tasks')
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      message.error('删除任务失败，请重试')
    }
    setDeleteModalVisible(false)
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Title level={3}>任务不存在</Title>
        <Button type="primary" onClick={() => navigate('/tasks')}>
          返回任务列表
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
              onClick={() => navigate('/tasks')}
            >
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              任务详情
            </Title>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              删除
            </Button>
          </Space>
        </div>

        <Descriptions
          bordered
          column={2}
          size="middle"
        >
          <Descriptions.Item label="任务ID">
            {task.id}
          </Descriptions.Item>
          <Descriptions.Item label="任务标题">
            {task.title}
          </Descriptions.Item>
          <Descriptions.Item label="任务状态">
            <Tag color={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Tag color={getPriorityColor(task.priority)}>
              {getPriorityText(task.priority)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="负责人">
            {task.assignee}
          </Descriptions.Item>
          <Descriptions.Item label="创建者">
            {task.creator}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {task.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            {task.dueDate}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新">
            {task.updatedAt}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: '24px' }}>
          <Title level={4}>任务描述</Title>
          <div style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            lineHeight: '1.6'
          }}>
            {task.description}
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <Title level={4}>操作记录</Title>
          <div style={{
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            color: '#666'
          }}>
            暂无操作记录
          </div>
        </div>
      </Card>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除任务 "{task.title}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请谨慎操作。</p>
      </Modal>
    </div>
  )
}

export default TaskDetail