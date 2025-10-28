/**
 * 银行账户管理页面
 */

import React from 'react'
import { Card, Typography, Table, Button, Space, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  accountType: 'checking' | 'savings' | 'credit'
  currency: string
  balance: number
  status: 'active' | 'inactive'
  createdAt: string
}

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = React.useState<BankAccount[]>([])
  const [modalVisible, setModalVisible] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<BankAccount | null>(null)
  const [form] = Form.useForm()

  // 模拟数据
  const mockAccounts: BankAccount[] = [
    {
      id: '1',
      bankName: '中国工商银行',
      accountNumber: '6222****1234',
      accountHolder: '张三',
      accountType: 'checking',
      currency: 'CNY',
      balance: 12500.00,
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      bankName: '中国建设银行',
      accountNumber: '6217****5678',
      accountHolder: '张三',
      accountType: 'savings',
      currency: 'CNY',
      balance: 28000.00,
      status: 'active',
      createdAt: '2024-01-10'
    }
  ]

  React.useEffect(() => {
    setAccounts(mockAccounts)
  }, [])

  const handleAdd = () => {
    setEditingAccount(null)
    setModalVisible(true)
    form.resetFields()
  }

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account)
    setModalVisible(true)
    form.setFieldsValue(account)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个银行账户吗？',
      onOk: () => {
        setAccounts(accounts.filter(acc => acc.id !== id))
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingAccount) {
        // 编辑
        setAccounts(accounts.map(acc =>
          acc.id === editingAccount.id ? { ...acc, ...values } : acc
        ))
      } else {
        // 新增
        const newAccount: BankAccount = {
          ...values,
          id: Date.now().toString(),
          balance: 0,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        }
        setAccounts([...accounts, newAccount])
      }
      setModalVisible(false)
    })
  }

  const getAccountTypeText = (type: string) => {
    const types = {
      checking: '活期账户',
      savings: '储蓄账户',
      credit: '信用卡'
    }
    return types[type as keyof typeof types] || type
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#52c41a' : '#d9d9d9'
  }

  const getStatusText = (status: string) => {
    return status === 'active' ? '正常' : '停用'
  }

  const columns: ColumnsType<BankAccount> = [
    {
      title: '银行名称',
      dataIndex: 'bankName',
      key: 'bankName',
    },
    {
      title: '账号',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: '账户持有人',
      dataIndex: 'accountHolder',
      key: 'accountHolder',
    },
    {
      title: '账户类型',
      dataIndex: 'accountType',
      key: 'accountType',
      render: (type: string) => getAccountTypeText(type),
    },
    {
      title: '币种',
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: BankAccount) => (
        <span style={{ color: record.balance < 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.currency} {Math.abs(balance).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: getStatusColor(status) }}>
          {getStatusText(status)}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="primary"
            danger
            size="small"
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2} style={{ margin: 0 }}>
            银行账户管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增账户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingAccount ? '编辑银行账户' : '新增银行账户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="bankName"
            label="银行名称"
            rules={[{ required: true, message: '请输入银行名称!' }]}
          >
            <Input placeholder="请输入银行名称" />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="账号"
            rules={[{ required: true, message: '请输入账号!' }]}
          >
            <Input placeholder="请输入银行账号" />
          </Form.Item>

          <Form.Item
            name="accountHolder"
            label="账户持有人"
            rules={[{ required: true, message: '请输入账户持有人!' }]}
          >
            <Input placeholder="请输入账户持有人姓名" />
          </Form.Item>

          <Form.Item
            name="accountType"
            label="账户类型"
            rules={[{ required: true, message: '请选择账户类型!' }]}
          >
            <Select placeholder="请选择账户类型">
              <Select.Option value="checking">活期账户</Select.Option>
              <Select.Option value="savings">储蓄账户</Select.Option>
              <Select.Option value="credit">信用卡</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="currency"
            label="币种"
            rules={[{ required: true, message: '请选择币种!' }]}
          >
            <Select placeholder="请选择币种">
              <Select.Option value="CNY">人民币</Select.Option>
              <Select.Option value="USD">美元</Select.Option>
              <Select.Option value="EUR">欧元</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态!' }]}
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BankAccounts