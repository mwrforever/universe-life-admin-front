import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Select,
  Space,
  Modal,
  Form,
  TreeSelect,
  Input,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { showSuccessMessage } from '../../utils/antdStatic';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  IdcardOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { employeeApi, departmentApi, roleApi } from '../../services/system';
import type { SysUserListVO, DepartmentTreeVO, RoleOptionVO } from '../../services/system';
import { CommonStatus, Gender } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, AvatarUpload, EnumDisplay, GenderDisplay, commonStatusConfig } from '../../components/System';
import { ThumbnailImage } from '../../components/common/ThumbnailImage';
import { useTheme } from '../../context/ThemeContext';
import { useTableLocalRefresh } from '../../hooks/useTableLocalRefresh';
import { generateDefaultPassword } from '../../utils/passwordGenerator';

const EmployeeManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<SysUserListVO | null>(null);
  const [form] = Form.useForm();
  const [deptTreeData, setDeptTreeData] = useState<DepartmentTreeVO[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOptionVO[]>([]);

  // 重置密码 Modal 相关状态
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [resetPasswordForm] = Form.useForm();

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
  } = useTableLocalRefresh<SysUserListVO>({
    primaryKey: 'id',
    spareCount: 5,
    filterValidator: (item, filters) => {
      // 关键词模糊匹配
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchName = item.realName?.toLowerCase().includes(keyword);
        const matchNo = item.employeeNo?.toLowerCase().includes(keyword);
        const matchUsername = item.username?.toLowerCase().includes(keyword);
        if (!matchName && !matchNo && !matchUsername) {
          return false;
        }
      }
      // 状态精确匹配
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      return true;
    },
    fetchList: async (params) => {
      const res = await employeeApi.getEmployeeList(params) as any;
      return res.data;
    },
    deleteItem: async (id) => {
      await employeeApi.deleteEmployee(id);
    },
    updateItem: async (id, data) => {
      await employeeApi.updateEmployee(id, data);
      // 重新获取详情返回完整数据
      const res = await employeeApi.getEmployeeById(id) as any;
      return res.data as SysUserListVO;
    },
    createItem: async (data) => {
      await employeeApi.createEmployee(data as any);
      // 创建后刷新列表获取新数据
      return null as any;
    },
  });

  // 获取部门树和角色选项
  const fetchDeptTree = async () => {
    try {
      const res = await departmentApi.getDepartmentTree();
      setDeptTreeData(res.data || []);
    } catch (error) {
      console.error('获取部门树失败');
    }
  };

  const fetchRoleOptions = async () => {
    try {
      const res = await roleApi.getRoleOptions();
      setRoleOptions(res.data || []);
    } catch (error) {
      console.error('获取角色选项失败');
    }
  };

  useEffect(() => {
    fetchDeptTree();
    fetchRoleOptions();
  }, []);

  // 计算活跃筛选条件数量
  const activeSearchCount = useMemo(() => {
    return Object.values(searchValues).filter(v => v !== undefined && v !== null && v !== '').length;
  }, [searchValues]);

  const handleSearchChange = (key: string, value: any) => {
    setSearchValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    handleFilterChange(searchValues, true);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchValues({});
    handleFilterChange({});
  };

  const handleEdit = async (record: SysUserListVO) => {
    try {
      const res = await employeeApi.getEmployeeById(record.id) as any;
      setEditingEmployee(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await hookHandleDelete(id);
      showSuccessMessage('删除成功');
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await employeeApi.updateEmployeeStatus(id, status as CommonStatus);
      showSuccessMessage('状态更新成功');
      await hookHandleUpdate(id, { status: status as CommonStatus } as Partial<SysUserListVO>);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleResetPassword = (id: string) => {
    const newPassword = generateDefaultPassword();
    setResetPasswordId(id);
    resetPasswordForm.setFieldsValue({ newPassword });
    setResetPasswordVisible(true);
  };

  const handleResetPasswordSubmit = async () => {
    try {
      const values = await resetPasswordForm.validateFields();
      await employeeApi.resetEmployeePassword(resetPasswordId!, values.newPassword);
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
    setResetPasswordId(null);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingEmployee) {
        await hookHandleUpdate(editingEmployee.id, values);
        showSuccessMessage('员工信息更新成功');
      } else {
        await hookHandleCreate({
          ...values,
          password: values.password || '123456',
        });
        showSuccessMessage('员工创建成功');
        refresh();
      }
      setModalVisible(false);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const statusOptions = [
    { label: '禁用', value: CommonStatus.DISABLED },
    { label: '启用', value: CommonStatus.ENABLED },
  ];

  const genderOptions = [
    { label: '保密', value: Gender.SECRET },
    { label: '男', value: Gender.MALE },
    { label: '女', value: Gender.FEMALE },
  ];

  const convertTreeData = (nodes: DepartmentTreeVO[]): any[] => {
    return nodes.map((node) => ({
      title: node.deptName,
      value: node.id,
      children: node.children ? convertTreeData(node.children) : [],
    }));
  };

  const columns: ColumnsType<SysUserListVO> = [
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 80,
      render: (url: string) => (
        <ThumbnailImage
          src={url}
          width={40}
          height={40}
          circle
          thumbnailSize="small"
          fallback={<UserOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />}
        />
      ),
    },
    {
      title: '员工编号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender: Gender) => <GenderDisplay value={gender} />,
    },
    {
      title: '主部门',
      dataIndex: 'primaryDeptName',
      key: 'primaryDeptName',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: CommonStatus) => (
        <EnumDisplay value={status} config={commonStatusConfig} size="small" />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
      title="员工管理"
      subtitle="管理平台员工账号和权限"
      icon={<IdcardOutlined />}
      breadcrumb={[
        { title: '系统模块' },
        { title: '员工管理' },
      ]}
    >
      <SearchFilterCard
        title="员工筛选"
        subtitle="根据条件快速查找员工"
        icon={<IdcardOutlined />}
        accentColor="#722ed1"
        onSearch={handleSearch}
        onReset={handleReset}
        onRefresh={refresh}
        filterCount={activeSearchCount}
      >
        <FormField label="关键词">
          <StyledInput
            isDark={isDarkMode}
            placeholder="员工编号/用户名/姓名"
            value={searchValues.keyword as string}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange('keyword', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="状态">
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
        <FormField label="部门">
          <TreeSelect
            placeholder="请选择部门"
            treeData={convertTreeData(deptTreeData)}
            value={searchValues.departmentId}
            onChange={(v) => handleSearchChange('departmentId', v)}
            allowClear
            treeDefaultExpandAll
            style={{ width: '100%' }}
          />
        </FormField>
      </SearchFilterCard>

      <DataTable<SysUserListVO>
        title="员工列表"
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增员工"
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
        title={editingEmployee ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={720}
        styles={{
          body: { padding: '24px 24px 8px' },
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col flex="140px">
              <Form.Item name="avatarUrl" label="员工头像">
                <AvatarUpload size={100} />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="请输入用户名" disabled={!!editingEmployee} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {!editingEmployee ? (
                    <Form.Item name="password" label="密码">
                      <Input.Password placeholder="默认密码：123456" />
                    </Form.Item>
                  ) : (
                    <Form.Item name="realName" label="姓名">
                      <Input placeholder="请输入姓名" />
                    </Form.Item>
                  )}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {!editingEmployee ? (
                    <Form.Item name="realName" label="姓名">
                      <Input placeholder="请输入姓名" />
                    </Form.Item>
                  ) : (
                    <Form.Item name="phone" label="手机号">
                      <Input placeholder="请输入手机号" />
                    </Form.Item>
                  )}
                </Col>
                <Col span={12}>
                  <Form.Item name="gender" label="性别">
                    <Select placeholder="请选择性别" options={genderOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              {!editingEmployee && (
                <Form.Item name="phone" label="手机号">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              )}
              {editingEmployee && (
                <Form.Item name="email" label="邮箱">
                  <Input placeholder="请输入邮箱" />
                </Form.Item>
              )}
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="primaryDepartmentId" label="主部门">
                <TreeSelect
                  placeholder="请选择主部门"
                  treeData={convertTreeData(deptTreeData)}
                  allowClear
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="departmentIds" label="所属部门">
                <TreeSelect
                  placeholder="请选择所属部门"
                  treeData={convertTreeData(deptTreeData)}
                  allowClear
                  treeDefaultExpandAll
                  multiple
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 重置密码 Modal */}
      <Modal
        title="重置员工密码"
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
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
            extra="系统已自动生成随机密码，可修改"
          >
            <Input.Password placeholder="请输入新密码" />
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
            <div>• 重置后员工需要使用新密码登录</div>
            <div>• 建议告知员工通过安全方式获取新密码</div>
            <div>• 员工首次登录后建议修改密码</div>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EmployeeManagement;
