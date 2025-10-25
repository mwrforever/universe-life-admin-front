/**
 * 编辑任务页面
 */

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Select, DatePicker, message, Space, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

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
}

const EditTask: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [form] = Form.useForm()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      fetchTask()
    }
  }, [id])

  const fetchTask = async () => {
    setFetchLoading(true)
    try {
      // 这里应该调用API获取任务详情
      // 模拟数据
      const mockTask: Task = {
        id: id || '1',
        title: '完成登录功能',
        description: '实现用户登录和JWT认证',
        status: 'in_progress',
        priority: 'high',
        assignee: '张三',
        creator: '李四',
        createdAt: '2024-01-15',
        dueDate: '2024-01-20'
      }

      setTimeout(() => {
        setTask(mockTask)
        form.setFieldsValue({
          title: mockTask.title,
          description: mockTask.description,
          priority: mockTask.priority,
          assignee: mockTask.assignee,
          dueDate: dayjs(mockTask.dueDate),
          status: mockTask.status
        })
        setFetchLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取任务详情失败')
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 这里应该调用API更新任务
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate.format('YYYY-MM-DD')
        }),
      })

      if (response.ok) {
        message.success('任务更新成功')
        navigate('/tasks')
      } else {
        throw new Error('更新失败')
      }
    } catch (error) {
      message.error('更新任务失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/tasks')
  }

  if (fetchLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Typography.Title level={3}>任务不存在</Typography.Title>
        <Button type="primary" onClick={() => navigate('/tasks')}>
          返回任务列表
        </Button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            style={{ marginRight: '16px' }}
          >
            返回
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            编辑任务
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{ maxWidth: '600px' }}
        >
          <Form.Item
            name="title"
            label="任务标题"
            rules={[
              { required: true, message: '请输入任务标题!' },
              { min: 2, message: '任务标题至少2个字符!' }
            ]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[
              { required: true, message: '请输入任务描述!' },
              { min: 10, message: '任务描述至少10个字符!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述任务内容..."
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="任务状态"
            rules={[{ required: true, message: '请选择任务状态!' }]}
          >
            <Select placeholder="请选择任务状态">
              <Option value="pending">待处理</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级!' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assignee"
            label="负责人"
            rules={[{ required: true, message: '请输入负责人!' }]}
          >
            <Input placeholder="请输入负责人姓名" />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择截止日期"
            />
          </Form.Item>

          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                更新任务
              </Button>
              <Button onClick={handleCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default EditTask