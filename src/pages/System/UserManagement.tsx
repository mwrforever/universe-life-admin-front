import React, { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Select,
  Space,
  Modal,
  Form,
  Tooltip,
  Input,
  Row,
  Col,
  Divider,
  Spin,
} from 'antd';
import { showSuccessMessage } from '../../utils/antdStatic';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userApi } from '../../services/system';
import type { AdminUserListVO } from '../../services/system';
import { UserStatus, UserStatusText, Gender } from '../../services/system';
import { SearchFilterCard, DataTable, FormField, StyledInput, StyledSelect, AvatarUpload, EnumDisplay, GenderDisplay, userStatusConfig } from '../../components/System';
import { ThumbnailImage } from '../../components/common/ThumbnailImage';
import { useTheme } from '../../context/ThemeContext';
import { useTableLocalRefresh } from '../../hooks/useTableLocalRefresh';
import { generateDefaultPassword } from '../../utils/passwordGenerator';
import { useUserDetail } from '../../hooks/useUserDetail';
import { 
  needsSignedUrl, 
  getSignedUrl, 
  isSignedUrlExpired,
  getValidSignedUrl,
  getCachedSignedUrl,
  getOriginalKey,
  updateSignedUrlCache,
  batchGetSignedUrlsV2,
} from '../../utils/signedUrl';

// 扩展用户列表类型，添加签名后的头像 URL
interface AdminUserListVOWithSignedUrl extends AdminUserListVO {
  signedAvatarUrl?: string;
  originalAvatarUrl?: string; // 保存原始 key 用于重新签名
}


const UserManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListVOWithSignedUrl | null>(null);
  const [form] = Form.useForm();

  // 重置密码 Modal 相关状态
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordForm] = Form.useForm();

  // 删除用户 Modal 相关状态
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteForm] = Form.useForm();

  // 查看详情 Modal 相关状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUserListVOWithSignedUrl | null>(null);

  // 筛选条件状态
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});

  // 用户详情 Hook
  const { 
    detail: userDetail, 
    loading: detailLoading, 
    error: detailError 
  } = useUserDetail({
    userId: editingUser?.id || null,
    enabled: modalVisible && !!editingUser,
  });

  // 查看详情用户详情 Hook
  const { 
    detail: viewUserDetail, 
    loading: viewDetailLoading, 
    error: viewDetailError 
  } = useUserDetail({
    userId: viewingUser?.id || null,
    enabled: viewModalVisible && !!viewingUser,
  });

  /**
   * 批量签名头像 URL（使用批量签名接口 V2）
   * 对分页数据中的头像进行签名处理
   * 分页请求时强制刷新签名，不使用缓存
   */
  const signAvatarUrls = useCallback(async (users: AdminUserListVO[]): Promise<AdminUserListVOWithSignedUrl[]> => {
    // 收集所有需要签名的头像 URL
    const avatarUrls: string[] = [];
    for (const user of users) {
      if (user.avatarUrl && needsSignedUrl(user.avatarUrl)) {
        avatarUrls.push(user.avatarUrl);
      }
    }

    // 批量获取签名 URL（强制刷新，不使用缓存）
    const signedUrlMap = avatarUrls.length > 0 
      ? await batchGetSignedUrlsV2(avatarUrls, true)
      : new Map<string, string>();

    // 构建结果
    const result: AdminUserListVOWithSignedUrl[] = [];
    for (const user of users) {
      const extendedUser: AdminUserListVOWithSignedUrl = { ...user };
      
      if (user.avatarUrl && needsSignedUrl(user.avatarUrl)) {
        // 保存原始 key
        extendedUser.originalAvatarUrl = user.avatarUrl;
        // 从批量签名结果中获取签名 URL
        const signedUrl = signedUrlMap.get(user.avatarUrl);
        if (signedUrl) {
          extendedUser.signedAvatarUrl = signedUrl;
        }
      } else if (user.avatarUrl) {
        // 已经是完整 URL，直接使用
        extendedUser.signedAvatarUrl = user.avatarUrl;
      }
      
      result.push(extendedUser);
    }
    
    return result;
  }, []);

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
  } = useTableLocalRefresh<AdminUserListVOWithSignedUrl>({
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
      console.log('🔍 fetchList 调用参数:', params);
      const res = await userApi.getUserList(params) as any;
      console.log('📦 fetchList 响应:', res);
      // res 已经是 { code: 1, data: { records, total }, message: '...' }
      const data = res.data;
      
      // 对头像 URL 进行签名处理
      if (data.records && data.records.length > 0) {
        data.records = await signAvatarUrls(data.records);
      }
      
      return data;
    },
    deleteItem: async (id, password) => {
      await userApi.deleteUser(id, password);
    },
    updateItem: async (id, data) => {
      const res = await userApi.updateUser(id, data) as any;
      // res 是 { code: 1, data: {...} | null, message: '...' }
      // 注意：后端可能不返回完整的用户数据
      
      // 如果后端返回了完整数据，使用后端数据；否则返回 null，让 handleUpdate 处理
      const backendData = res.data;
      
      // 处理头像签名 URL
      const avatarUrl = (data as any).avatarUrl;
      let signedAvatarUrl: string | undefined;
      let originalAvatarUrl: string | undefined;
      
      if (avatarUrl) {
        // avatarUrl 此时应该是原始 key（handleModalOk 中已经处理过）
        // 先检查缓存中是否有签名 URL（AvatarUpload 上传成功后会缓存）
        const cached = getCachedSignedUrl(avatarUrl);
        console.log('🔍 updateItem - 头像URL:', avatarUrl, '缓存:', cached);
        
        if (cached && !isSignedUrlExpired(avatarUrl)) {
          // 缓存有效，直接使用缓存的签名 URL
          signedAvatarUrl = cached.url;
          originalAvatarUrl = avatarUrl;
          console.log('✅ 使用缓存的签名URL:', signedAvatarUrl);
        } else if (needsSignedUrl(avatarUrl)) {
          // 缓存无效或不存在，需要获取签名
          originalAvatarUrl = avatarUrl;
          const signed = await getSignedUrl(avatarUrl);
          if (signed) {
            signedAvatarUrl = signed;
          }
          console.log('🔄 获取新的签名URL:', signedAvatarUrl);
        } else {
          // 已经是完整 URL，尝试从缓存中获取原始 key
          const foundOriginalKey = getOriginalKey(avatarUrl);
          if (foundOriginalKey !== avatarUrl) {
            // 找到了原始 key
            originalAvatarUrl = foundOriginalKey;
            signedAvatarUrl = avatarUrl;
            console.log('🔑 从缓存中找到原始key:', originalAvatarUrl);
          } else {
            // 无法找到原始 key，使用签名 URL 作为显示
            // 注意：这种情况下 avatarUrl 字段会是签名 URL，可能导致后端保存错误
            signedAvatarUrl = avatarUrl;
            console.warn('⚠️ 无法找到原始key，头像URL是完整URL:', avatarUrl);
          }
        }
      }
      
      // 返回更新后的数据（包含签名 URL）
      // handleUpdate 会将这个数据与原始数据合并
      const result = {
        ...(backendData || {}),
        ...data,
        avatarUrl: originalAvatarUrl || avatarUrl,
        signedAvatarUrl,
        originalAvatarUrl,
      } as AdminUserListVOWithSignedUrl;
      
      console.log('📦 updateItem 返回:', result);
      return result;
    },
    createItem: async (data) => {
      const res = await userApi.createUser(data as any) as any;
      const newUser = res.data as AdminUserListVOWithSignedUrl;
      
      // 检查缓存中是否有签名 URL（AvatarUpload 上传成功后会缓存）
      if (newUser.avatarUrl) {
        const cached = getCachedSignedUrl(newUser.avatarUrl);
        if (cached && !isSignedUrlExpired(newUser.avatarUrl)) {
          // 缓存有效，直接使用缓存的签名 URL
          newUser.signedAvatarUrl = cached.url;
          newUser.originalAvatarUrl = newUser.avatarUrl;
        } else if (needsSignedUrl(newUser.avatarUrl)) {
          // 缓存无效或不存在，需要获取签名
          newUser.originalAvatarUrl = newUser.avatarUrl;
          const signedUrl = await getSignedUrl(newUser.avatarUrl);
          if (signedUrl) {
            newUser.signedAvatarUrl = signedUrl;
          }
        } else {
          // 已经是完整 URL
          newUser.signedAvatarUrl = newUser.avatarUrl;
        }
      }
      
      return newUser;
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

  const handleView = async (record: AdminUserListVOWithSignedUrl) => {
    setViewingUser(record);
    setViewModalVisible(true);
  };

  const handleViewClose = () => {
    setViewModalVisible(false);
    setViewingUser(null);
  };

  const handleEdit = async (record: AdminUserListVOWithSignedUrl) => {
    setEditingUser(record);
    
    // 检查签名链接是否过期，如果过期则重新获取
    let avatarUrlForForm = record.signedAvatarUrl || record.avatarUrl;
    const originalKey = record.originalAvatarUrl || record.avatarUrl;
    
    if (originalKey && isSignedUrlExpired(originalKey)) {
      // 签名已过期，重新获取
      const newSignedUrl = await getValidSignedUrl(originalKey);
      if (newSignedUrl) {
        avatarUrlForForm = newSignedUrl;
      }
    }
    
    // 确保签名 URL 被缓存，以便后续 getOriginalKey 能找到
    // 这样用户不修改头像直接保存时，也能正确获取原始 key
    if (originalKey && avatarUrlForForm && needsSignedUrl(originalKey)) {
      // 获取缓存中的过期时间，如果没有则使用默认值
      const cached = getCachedSignedUrl(originalKey);
      const expireAt = cached?.expireAt || Math.floor(Date.now() / 1000) + 30 * 60;
      updateSignedUrlCache(originalKey, avatarUrlForForm, expireAt);
      console.log('📦 handleEdit 缓存签名 URL:', { originalKey, avatarUrlForForm, expireAt });
    }
    
    // 设置表单值，使用签名后的头像 URL
    form.setFieldsValue({
      ...record,
      avatarUrl: avatarUrlForForm,
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    // 设置新增用户的默认值
    form.setFieldsValue({
      gender: Gender.SECRET,  // 默认性别：保密
      status: UserStatus.NORMAL,  // 默认状态：正常
    });
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
      showSuccessMessage('删除成功');
      setDeleteVisible(false);
      deleteForm.resetFields();
      setDeleteUserId(null);
    } catch (error) {
      // 错误已由 request 拦截器处理，这里不需要重复显示
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
      showSuccessMessage('状态更新成功');
      // 直接更新本地数据，不调用 hookHandleUpdate（因为状态更新接口不返回完整对象）
      // 刷新列表以获取最新数据
      refresh();
    } catch (error) {
      // 错误已由 request 拦截器处理
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
      showSuccessMessage('密码重置成功');
      setResetPasswordVisible(false);
      resetPasswordForm.resetFields();
    } catch (error) {
      // 错误已由 request 拦截器处理
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
      console.log('📝 handleModalOk - 表单值:', values);
      
      if (editingUser) {
        // 处理头像 URL：如果是签名 URL，需要提取原始 key
        let avatarUrlToSubmit = values.avatarUrl;
        console.log('🔍 表单中的原始头像URL:', avatarUrlToSubmit);
        
        if (avatarUrlToSubmit && (avatarUrlToSubmit.startsWith('http://') || avatarUrlToSubmit.startsWith('https://'))) {
          // 尝试从缓存中获取原始 key
          const originalKey = getOriginalKey(avatarUrlToSubmit);
          console.log('🔑 getOriginalKey 结果:', originalKey);
          
          if (originalKey !== avatarUrlToSubmit) {
            avatarUrlToSubmit = originalKey;
          } else if (editingUser.originalAvatarUrl) {
            // 如果无法从缓存获取，使用编辑用户的原始 key
            avatarUrlToSubmit = editingUser.originalAvatarUrl;
            console.log('📦 使用 editingUser.originalAvatarUrl:', avatarUrlToSubmit);
          }
        }
        
        console.log('✅ 最终提交的头像URL:', avatarUrlToSubmit);
        
        // 只提交可编辑的基本信息字段，不提交详情字段
        const submitData = {
          avatarUrl: avatarUrlToSubmit,
          gender: values.gender,
          status: values.status,
        };
        
        console.log('📤 提交数据:', submitData);
        
        // 使用 hookHandleUpdate 更新本地数据
        await hookHandleUpdate(editingUser.id, submitData);
        showSuccessMessage('用户信息更新成功');
        // 关闭弹窗并重置状态
        setModalVisible(false);
        form.resetFields();
        setEditingUser(null);
      } else {
        // 处理新增用户的头像 URL
        let avatarUrlToSubmit = values.avatarUrl;
        if (avatarUrlToSubmit && (avatarUrlToSubmit.startsWith('http://') || avatarUrlToSubmit.startsWith('https://'))) {
          const originalKey = getOriginalKey(avatarUrlToSubmit);
          if (originalKey !== avatarUrlToSubmit) {
            avatarUrlToSubmit = originalKey;
          }
        }
        
        // 新增用户
        await hookHandleCreate({
          ...values,
          avatarUrl: avatarUrlToSubmit,
          userAuthList: [{
            identificationType: 4, // 用户名类型
            identification: values.username,
            password: values.password || '123456'
          }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        showSuccessMessage('用户创建成功');
        // 关闭弹窗并重置状态
        setModalVisible(false);
        form.resetFields();
      }
    } catch (error) {
      // 错误已由 request 拦截器处理，弹窗保持打开
      console.error('handleModalOk error:', error);
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

  const columns: ColumnsType<AdminUserListVOWithSignedUrl> = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 80,
      render: (_: string, record: AdminUserListVOWithSignedUrl) => (
        <ThumbnailImage
          src={record.signedAvatarUrl || record.avatarUrl || ''}
          width={40}
          height={40}
          circle
          thumbnailSize="small"
          fallback={<UserOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />}
        />
      ),
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
      render: (gender: Gender) => <GenderDisplay value={gender} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus) => (
        <EnumDisplay value={status} config={userStatusConfig} size="small" />
      ),
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
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
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
    <div style={{ height: '100%', overflow: 'auto', padding: '0 16px 16px' }}>
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

      <DataTable<AdminUserListVOWithSignedUrl>
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
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        width={800}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        <Form form={form} layout="vertical">
          {/* 可编辑区域 - 基本信息 */}
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

          {/* 只读区域 - 用户详情（仅编辑模式显示） */}
          {editingUser && (
            <>
              <Divider style={{ margin: '16px 0' }}>
                <span style={{ 
                  color: isDarkMode ? '#8c8c8c' : '#999', 
                  fontSize: '12px',
                  fontWeight: 'normal',
                }}>
                  用户详情（只读）
                </span>
              </Divider>
              
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Spin>
                    <div style={{ padding: '20px', color: isDarkMode ? '#8c8c8c' : '#666' }}>
                      加载用户详情中...
                    </div>
                  </Spin>
                </div>
              ) : detailError ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px', 
                  color: isDarkMode ? '#ff7875' : '#cf1322',
                  backgroundColor: isDarkMode ? '#2a1f1f' : '#fff2f0',
                  borderRadius: '4px',
                }}>
                  加载用户详情失败：{detailError.message}
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                }}>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="简介" style={{ marginBottom: 12 }}>
                        <Input.TextArea 
                          value={userDetail?.bio || '-'} 
                          disabled 
                          rows={2}
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                            cursor: 'not-allowed',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="生日" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.birthday || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="接单数" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.receiveOrder?.toString() || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="国家" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.country || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="省份" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.province || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="城市" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.city || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="街道" style={{ marginBottom: 12 }}>
                        <Input 
                          value={userDetail?.road || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="详细地址" style={{ marginBottom: 0 }}>
                        <Input 
                          value={userDetail?.address || '-'} 
                          disabled 
                          style={{ 
                            backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                            color: isDarkMode ? '#8c8c8c' : '#666',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}
            </>
          )}
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

      {/* 查看用户详情 Modal（只读） */}
      <Modal
        title="用户详情"
        open={viewModalVisible}
        onCancel={handleViewClose}
        width={800}
        footer={[
          <Button key="close" onClick={handleViewClose}>
            关闭
          </Button>,
        ]}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        {viewDetailLoading ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Spin>
              <div style={{ padding: '20px', color: isDarkMode ? '#8c8c8c' : '#666' }}>
                加载用户详情中...
              </div>
            </Spin>
          </div>
        ) : viewDetailError ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: isDarkMode ? '#ff7875' : '#cf1322',
            backgroundColor: isDarkMode ? '#2a1f1f' : '#fff2f0',
            borderRadius: '4px',
          }}>
            加载用户详情失败：{viewDetailError.message}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
          }}>
            {/* 基本信息 */}
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col flex="100px">
                <ThumbnailImage
                  src={viewingUser?.signedAvatarUrl || viewingUser?.avatarUrl || ''}
                  width={80}
                  height={80}
                  circle
                  thumbnailSize="medium"
                  fallback={<UserOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />}
                />
              </Col>
              <Col flex="1">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="用户名" style={{ marginBottom: 12 }}>
                      <Input 
                        value={viewingUser?.username || '-'} 
                        disabled 
                        style={{ 
                          backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                          color: isDarkMode ? '#8c8c8c' : '#666',
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="性别" style={{ marginBottom: 12 }}>
                      <Input 
                        value={viewingUser?.gender !== undefined ? genderOptions.find(g => g.value === viewingUser.gender)?.label || '-' : '-'} 
                        disabled 
                        style={{ 
                          backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                          color: isDarkMode ? '#8c8c8c' : '#666',
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="状态" style={{ marginBottom: 12 }}>
                      <Input 
                        value={viewingUser?.status !== undefined ? statusOptions.find(s => s.value === viewingUser.status)?.label || '-' : '-'} 
                        disabled 
                        style={{ 
                          backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                          color: isDarkMode ? '#8c8c8c' : '#666',
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="最后登录" style={{ marginBottom: 12 }}>
                      <Input 
                        value={viewingUser?.lastLoginAt || '-'} 
                        disabled 
                        style={{ 
                          backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                          color: isDarkMode ? '#8c8c8c' : '#666',
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }}>
              <span style={{ 
                color: isDarkMode ? '#8c8c8c' : '#999', 
                fontSize: '12px',
                fontWeight: 'normal',
              }}>
                详细信息
              </span>
            </Divider>

            {/* 详细信息 */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="简介" style={{ marginBottom: 12 }}>
                  <Input.TextArea 
                    value={viewUserDetail?.bio || '-'} 
                    disabled 
                    rows={2}
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                      cursor: 'not-allowed',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="生日" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.birthday || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="接单数" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.receiveOrder?.toString() || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="国家" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.country || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="省份" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.province || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="城市" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.city || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="街道" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.road || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="详细地址" style={{ marginBottom: 12 }}>
                  <Input 
                    value={viewUserDetail?.address || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="创建时间" style={{ marginBottom: 0 }}>
                  <Input 
                    value={viewingUser?.createdAt || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="更新时间" style={{ marginBottom: 0 }}>
                  <Input 
                    value={viewingUser?.updatedAt || '-'} 
                    disabled 
                    style={{ 
                      backgroundColor: isDarkMode ? '#141414' : '#f5f5f5',
                      color: isDarkMode ? '#8c8c8c' : '#666',
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
