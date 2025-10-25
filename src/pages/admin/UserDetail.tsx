/**
 * 用户详情页面
 */

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Descriptions, Tag, Spin, Space, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'

const { Title } = Typography

interface User {
  id: string
  username: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin: string
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    setLoading(true)
    try {
      // 这里应该调用API获取用户详情
      // 模拟数据
      const mockUser: User = {
        id: id || '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20 10:30:00'
      }

      setTimeout(() => {
        setUser(mockUser)
        setLoading(false)
      }, 500)
    } catch (error) {
      message.error('获取用户详情失败')
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/users/${id}/edit`)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Title level={3}>用户不存在</Title>
        <Button type="primary" onClick={() => navigate('/users')}>
          返回用户列表
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
              onClick={() => navigate('/users')}
            >
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              用户详情
            </Title>
          </Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            编辑
          </Button>
        </div>

        <Descriptions
          bordered
          column={2}
          size="middle"
        >
          <Descriptions.Item label="用户ID">
            {user.id}
          </Descriptions.Item>
          <Descriptions.Item label="用户名">
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
              {user.role === 'admin' ? '管理员' : '普通用户'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={user.status === 'active' ? 'green' : 'red'}>
              {user.status === 'active' ? '活跃' : '禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {user.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录">
            {user.lastLogin}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default UserDetail