/**
 * 用户管理页面
 */

import { useEffect } from 'react'
import { Card, Typography, Table, Tag, Space, Button, Input, Select, Avatar, Row, Col, Statistic, Modal, Form, message } from 'antd'
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CrownOutlined,
  TeamOutlined,
  WomanOutlined,
  ManOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography
const { Search } = Input

interface User {
  key: string
  id: string
  username: string
  email: string
  phone: string
  realName: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
  status: 'active' | 'inactive' | 'banned'
  role: 'admin' | 'vip' | 'member' | 'user'
  registerTime: string
  lastLoginTime?: string
  totalOrders: number
  totalSpent: number
}

function Users() {
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)
  const [editModalVisible, setEditModalVisible] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    console.log('👥 用户管理组件已挂载')
    // 初始化模拟数据
    setUsers([
      {
        key: '1',
        id: 'USR-001',
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        realName: '张三',
        gender: 'male',
        status: 'active',
        role: 'vip',
        registerTime: '2025-09-15 10:30:00',
        lastLoginTime: '2025-10-21 14:25:00',
        totalOrders: 23,
        totalSpent: 2580.00
      },
      {
        key: '2',
        id: 'USR-002',
        username: 'lisi',
        email: 'lisi@example.com',
        phone: '13800138002',
        realName: '李四',
        gender: 'female',
        status: 'active',
        role: 'member',
        registerTime: '2025-09-20 14:15:00',
        lastLoginTime: '2025-10-21 12:18:00',
        totalOrders: 15,
        totalSpent: 1290.00
      },
      {
        key: '3',
        id: 'USR-003',
        username: 'wangwu',
        email: 'wangwu@example.com',
        phone: '13800138003',
        realName: '王五',
        gender: 'male',
        status: 'inactive',
        role: 'user',
        registerTime: '2025-10-01 09:20:00',
        lastLoginTime: '2025-10-18 16:45:00',
        totalOrders: 8,
        totalSpent: 599.00
      },
      {
        key: '4',
        id: 'USR-004',
        username: 'zhaoliu',
        email: 'zhaoliu@example.com',
        phone: '13800138004',
        realName: '赵六',
        gender: 'female',
        status: 'banned',
        role: 'user',
        registerTime: '2025-10-05 11:10:00',
        lastLoginTime: '2025-10-15 10:30:00',
        totalOrders: 3,
        totalSpent: 199.00
      }
    ])
  }, [])

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            size="large"
            src={record.avatar}
            icon={<UserOutlined />}
            style={{
              backgroundColor: record.gender === 'male' ? '#0052D9' : '#FF69B4',
              border: record.status === 'banned' ? '2px solid #FF3B30' : 'none'
            }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>
              {record.realName}
              {record.gender === 'male' ? (
                <ManOutlined style={{ marginLeft: '4px', color: '#0052D9' }} />
              ) : record.gender === 'female' ? (
                <WomanOutlined style={{ marginLeft: '4px', color: '#FF69B4' }} />
              ) : null}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              @{record.username} • {record.id}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px' }}>{record.email}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: '用户角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          admin: { color: 'red', text: '管理员', icon: <CrownOutlined /> },
          vip: { color: 'gold', text: 'VIP用户', icon: <CrownOutlined /> },
          member: { color: 'blue', text: '会员用户', icon: <UserOutlined /> },
          user: { color: 'default', text: '普通用户', icon: <UserOutlined /> }
        }
        const config = roleMap[role as keyof typeof roleMap]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '用户状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '正常', icon: <UnlockOutlined /> },
          inactive: { color: 'warning', text: '未激活', icon: <LockOutlined /> },
          banned: { color: 'error', text: '已封禁', icon: <LockOutlined /> }
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
      title: '消费统计',
      key: 'stats',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0052D9' }}>
            ¥{record.totalSpent.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.totalOrders} 笔订单
          </div>
        </div>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
      render: (time: string) => (
        <div style={{ fontSize: '13px' }}>{time}</div>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      render: (time?: string) => (
        <div style={{ fontSize: '13px', color: time ? '#000' : '#8c8c8c' }}>
          {time || '从未登录'}
        </div>
      )
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
          {record.status === 'active' ? (
            <Button type="link" size="small" danger icon={<LockOutlined />}>
              禁用
            </Button>
          ) : (
            <Button type="link" size="small" style={{ color: '#07C160' }} icon={<UnlockOutlined />}>
              启用
            </Button>
          )}
        </Space>
      )
    }
  ]

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    form.setFieldsValue(user)
    setEditModalVisible(true)
  }

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('用户信息更新成功！')
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
          👥 用户管理
        </Title>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={3264}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#0052D9' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={2156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#07C160' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="VIP用户"
              value={428}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#FF9F00' }}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={28}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#86909C' }}
              suffix="人"
            />
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              用户列表
            </Title>
          </div>
          <Space>
            <Search
              placeholder="搜索用户名、邮箱、手机号..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">未激活</Select.Option>
              <Select.Option value="banned">已封禁</Select.Option>
            </Select>
            <Select defaultValue="all" style={{ width: 120 }}>
              <Select.Option value="all">全部角色</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="vip">VIP用户</Select.Option>
              <Select.Option value="member">会员用户</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />}>
              添加用户
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          pagination={{
            total: users.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户信息"
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="真实姓名" name="realName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="邮箱" name="email" rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="用户角色" name="role">
                <Select>
                  <Select.Option value="admin">管理员</Select.Option>
                  <Select.Option value="vip">VIP用户</Select.Option>
                  <Select.Option value="member">会员用户</Select.Option>
                  <Select.Option value="user">普通用户</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="用户状态" name="status">
                <Select>
                  <Select.Option value="active">正常</Select.Option>
                  <Select.Option value="inactive">未激活</Select.Option>
                  <Select.Option value="banned">已封禁</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

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

export default Users