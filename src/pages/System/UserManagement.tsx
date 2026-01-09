import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
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
import type { AdminUserListVO } from '../../services/system';
import { UserStatus, UserStatusText, UserStatusColor, Gender } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, AvatarUpload } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';
import { useTableLocalRefresh } from '../../hooks/useTableLocalRefresh';
import { generateDefaultPassword } from '../../utils/passwordGenerator';


const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListVO | null>(null);
  const [form] = Form.useForm();

  // 重置密码 Modal 相关状态
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordForm] = Form.useForm();

  // 删除用户 Modal 相关状态
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteForm] = Form.useForm();

  // 筛选条件状态
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});

  // 使用表格局部刷新 Hook
  const {
    displayData,
    loading,
    pagination,
    handleDelete: hookHandleDelete,
    handleUpdate: hookHandleUpdate,
    handleCreate: hookHandleCreate,
    handlePageChange,
    handleFilterChange,
    refresh,
  } = useTableLocalRefresh<AdminUserListVO>({
    primaryKey: 'id',
    spareCount: 5,
    filterValidator: (item, filters) => {
      // 用户名模糊匹配
      if (filters.username && !item.username.includes(filters.username)) {
        return false;
      }
      // 状态精确匹配
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      // 性别精确匹配
      if (filters.gender !== undefined && item.gender !== filters.gender) {
        return false;
      }
      return true;
    },
    // request 拦截器已经解包了响应，返回格式为 { code, data, message }
    fetchList: async (params) => {
      console.log('🔍 fetchList called with params:', params);
      const res = await userApi.getUserList(params) as any;
      console.log('📦 fetchList response:', res);
      // res 已经是 { code: 1, data: { records, total }, message: '...' }
      return res.data;
    },
    deleteItem: async (id, password) => {
      await userApi.deleteUser(id, password);
    },
    updateItem: async (id, data) => {
      const res = await userApi.updateUser(id, data) as any;
      return res.data as AdminUserListVO;
    },
    createItem: async (data) => {
      const res = await userApi.createUser(data as any) as any;
      return res.data;
    },
  });

  // 计算活跃筛选条件数量
  const activeSearchCount = useMemo(() => {
    return Object.values(searchValues).filter(v => v !== undefined && v !== null && v !== '').length;
  }, [searchValues]);

  const handleSearchChange = (key: string, value: any) => {
    setSearchValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // 强制刷新，即使筛选条件没变也发请求
    handleFilterChange(searchValues, true);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
    handleFilterChange({});
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

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
    deleteForm.resetFields();
    setDeleteVisible(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      const values = await deleteForm.validateFields();
      await hookHandleDelete(deleteUserId!, values.password);
      message.success('删除成功');
      setDeleteVisible(false);
      deleteForm.resetFields();
      setDeleteUserId(null);
    } catch (error) {
      message.error('删除失败，请检查密码是否正确');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteVisible(false);
    deleteForm.resetFields();
    setDeleteUserId(null);
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await userApi.updateUserStatus({ id, status: status as UserStatus });
      message.success('状态更新成功');
      // 使用 Hook 的 handleUpdate 来更新本地数据
      await hookHandleUpdate(id, { status: status as UserStatus } as Partial<AdminUserListVO>);
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleResetPassword = (id: string) => {
    // 生成随机6位密码
    const newPassword = generateDefaultPassword();
    setResetPasswordUserId(id);

    // 设置表单初始值
    resetPasswordForm.setFieldsValue({
      newPassword: newPassword,
      adminPassword: '',
    });

    setResetPasswordVisible(true);
  };

  const handleResetPasswordSubmit = async () => {
    try {
      const values = await resetPasswordForm.validateFields();
      await userApi.resetUserPassword(resetPasswordUserId!, {
        adminPassword: values.adminPassword,
        newPassword: values.newPassword,
      });
      message.success('密码重置成功');
      setResetPasswordVisible(false);
      resetPasswordForm.resetFields();
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  const handleResetPasswordCancel = () => {
    setResetPasswordVisible(false);
    resetPasswordForm.resetFields();
    setResetPasswordUserId(null);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await hookHandleUpdate(editingUser.id, values);
        message.success('更新成功');
      } else {
        await hookHandleCreate({
          ...values,
          userAuthList: [{
            identificationType: 4, // 用户名类型
            identification: values.username,
            password: values.password || '123456'
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const statusOptions = [
    { label: UserStatusText[UserStatus.NORMAL], value: UserStatus.NORMAL },
    { label: UserStatusText[UserStatus.CAN_RECEIVE], value: UserStatus.CAN_RECEIVE },
    { label: UserStatusText[UserStatus.CAN_PUBLISH], value: UserStatus.CAN_PUBLISH },
    { label: UserStatusText[UserStatus.DISABLE], value: UserStatus.DISABLE },
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
      render: (status: UserStatus) => {
        const text = UserStatusText[status] || '未知';
        const color = UserStatusColor[status] || 'default';
        return <Tag color={color}>{text}</Tag>;
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
            <Button
              type="link"
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={statusOptions}
          />
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
        onSearch={handleSearch}
        onReset={handleReset}
        onRefresh={refresh}
        filterCount={activeSearchCount}
      >
        <FormField label="用户名">
          <StyledInput
            isDark={isDarkMode}
            placeholder="请输入用户名"
            value={searchValues.username as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange('username', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="用户状态">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择状态"
            value={searchValues.status as any}
            onChange={(v: any) => handleSearchChange('status', v)}
            options={statusOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FormField>
        <FormField label="性别">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择性别"
            value={searchValues.gender as any}
            onChange={(v: any) => handleSearchChange('gender', v)}
            options={genderOptions}
            allowClear
            style={{ width: '100%' }}
          />
        </FormField>
      </SearchFilterCard>

      <DataTable<AdminUserListVO>
        title="用户列表"
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增用户"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: handlePageChange,
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
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

      {/* 重置密码 Modal */}
      <Modal
        title="重置用户密码"
        open={resetPasswordVisible}
        onOk={handleResetPasswordSubmit}
        onCancel={handleResetPasswordCancel}
        width={480}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        <Form form={resetPasswordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="用户新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
            extra="系统已自动生成随机密码，管理员可修改"
          >
            <Input.Password
              placeholder="请输入新密码"
              disabled={false}
            />
          </Form.Item>

          <Form.Item
            name="adminPassword"
            label="管理员密码"
            rules={[
              { required: true, message: '请输入管理员密码以确认操作' },
            ]}
            extra="需要输入当前管理员密码以确认此操作"
          >
            <Input.Password
              placeholder="请输入管理员密码"
            />
          </Form.Item>

          <div style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            color: isDarkMode ? '#d9d9d9' : '#666',
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>⚠️ 安全提示：</strong>
            </div>
            <div>• 重置后用户需要使用新密码登录</div>
            <div>• 建议告知用户通过安全方式获取新密码</div>
            <div>• 用户首次登录后建议修改密码</div>
          </div>
        </Form>
      </Modal>

      {/* 删除用户 Modal */}
      <Modal
        title="删除用户确认"
        open={deleteVisible}
        onOk={handleDeleteSubmit}
        onCancel={handleDeleteCancel}
        width={480}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        <Form form={deleteForm} layout="vertical">
          <Form.Item
            name="password"
            label="管理员密码"
            rules={[
              { required: true, message: '请输入管理员密码以确认删除操作' },
            ]}
            extra="需要输入当前管理员密码以确认此危险操作"
          >
            <Input.Password
              placeholder="请输入管理员密码"
            />
          </Form.Item>

          <div style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#fff3f3',
            borderRadius: '4px',
            fontSize: '12px',
            color: isDarkMode ? '#ff7875' : '#cf1322',
            border: `1px solid ${isDarkMode ? '#ff4d4f' : '#ffccc7'}`,
          }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>⚠️ 危险操作警告：</strong>
            </div>
            <div>• 删除用户后，该用户将无法登录系统</div>
            <div>• 用户的相关数据将被软删除</div>
            <div>• 此操作需要管理员密码确认</div>
            <div>• 请谨慎操作，确保删除正确的用户</div>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UserManagement;
