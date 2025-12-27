import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
  Input,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '../../services/system';
import type { AdminUserListVO, UserListParams } from '../../services/system';
import { UserStatus, Gender } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, AvatarUpload } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';


const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminUserListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<UserListParams>({ page: 1, size: 10 });
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListVO | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUserList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  const handleSearch = (values: any) => {
    setParams({ ...params, ...values, page: 1 });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setParams({ page: 1, size: 10 });
  };

  const handleEdit = (record: AdminUserListVO) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userApi.deleteUser(id, '');
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await userApi.updateUserStatus(id, status as UserStatus);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      await userApi.resetUserPassword(id, '123456');
      message.success('密码重置成功，默认密码：123456');
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userApi.updateUser(editingUser.id, values);
        message.success('更新成功');
      } else {
        await userApi.createUser({
          ...values,
          userAuthList: [{ identityType: 'username', identifier: values.username, credential: values.password || '123456' }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const statusOptions = [
    { label: '禁用', value: UserStatus.DISABLED },
    { label: '正常', value: UserStatus.NORMAL },
    { label: '锁定', value: UserStatus.LOCKED },
  ];

  const genderOptions = [
    { label: '保密', value: Gender.SECRET },
    { label: '男', value: Gender.MALE },
    { label: '女', value: Gender.FEMALE },
  ];

  const columns: ColumnsType<AdminUserListVO> = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 80,
      render: (url: string) => <Avatar src={url} icon={<UserOutlined />} />,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: number) => {
        const map: Record<number, string> = { 0: '保密', 1: '男', 2: '女' };
        return map[gender] || '未知';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '禁用' },
          1: { color: 'success', text: '正常' },
          2: { color: 'warning', text: '锁定' },
        };
        const item = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="重置密码">
            <Popconfirm title="确定重置密码吗？" onConfirm={() => handleResetPassword(record.id)}>
              <Button type="link" size="small" icon={<LockOutlined />} />
            </Popconfirm>
          </Tooltip>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={statusOptions}
          />
          <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filterCount = useMemo(() => {
    return Object.values(searchValues).filter(v => v !== undefined && v !== '').length;
  }, [searchValues]);

  const handleSearchChange = (key: string, value: any) => {
    setSearchValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <PageContainer
      title="用户管理"
      subtitle="管理平台用户账号、权限和状态"
      icon={<UserOutlined />}
      breadcrumb={[
        { title: '系统模块' },
        { title: '用户管理' },
      ]}
    >
      <SearchFilterCard
        title="用户筛选"
        subtitle="根据条件快速查找用户"
        icon={<UserOutlined />}
        accentColor="#1677ff"
        onSearch={() => handleSearch(searchValues)}
        onReset={handleReset}
        filterCount={filterCount}
      >
        <FormField label="用户名">
          <StyledInput
            isDark={isDarkMode}
            placeholder="请输入用户名"
            value={searchValues.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange('username', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="用户状态">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择状态"
            value={searchValues.status}
            onChange={v => handleSearchChange('status', v)}
            options={statusOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FormField>
        <FormField label="性别">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择性别"
            value={searchValues.gender}
            onChange={v => handleSearchChange('gender', v)}
            options={genderOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FormField>
      </SearchFilterCard>

      <DataTable<AdminUserListVO>
        title="用户列表"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增用户"
        pagination={{
          current: params.page,
          pageSize: params.size,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: (page: number, size: number) => setParams({ ...params, page, size }),
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        width={640}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col flex="140px">
              <Form.Item name="avatarUrl" label="用户头像">
                <AvatarUpload size={100} />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="请输入用户名" disabled={!!editingUser} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {!editingUser ? (
                    <Form.Item name="password" label="密码">
                      <Input.Password placeholder="默认密码：123456" />
                    </Form.Item>
                  ) : (
                    <Form.Item name="gender" label="性别">
                      <Select placeholder="请选择性别" options={genderOptions} />
                    </Form.Item>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {!editingUser ? (
                    <Form.Item name="gender" label="性别">
                      <Select placeholder="请选择性别" options={genderOptions} />
                    </Form.Item>
                  ) : (
                    <Form.Item name="status" label="状态">
                      <Select placeholder="请选择状态" options={statusOptions} />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  {!editingUser && (
                    <Form.Item name="status" label="状态">
                      <Select placeholder="请选择状态" options={statusOptions} />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
