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
  TreeSelect,
  Input,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { employeeApi, departmentApi, roleApi } from '../../services/system';
import type { SysUserListVO, EmployeeListParams, DepartmentTreeVO, RoleOptionVO } from '../../services/system';
import { CommonStatus, Gender } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, AvatarUpload } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';

const EmployeeManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SysUserListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<EmployeeListParams>({ page: 1, size: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<SysUserListVO | null>(null);
  const [form] = Form.useForm();
  const [deptTreeData, setDeptTreeData] = useState<DepartmentTreeVO[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleOptionVO[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getEmployeeList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取员工列表失败');
    } finally {
      setLoading(false);
    }
  };

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
    fetchData();
    fetchDeptTree();
    fetchRoleOptions();
  }, [params]);

  const handleSearch = (values: any) => {
    setParams({ ...params, ...values, page: 1 });
  };

  const handleReset = () => {
    setSearchValues({});
    setParams({ page: 1, size: 10 });
  };

  const handleEdit = async (record: SysUserListVO) => {
    try {
      const res = await employeeApi.getEmployeeById(record.id);
      setEditingEmployee(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取员工详情失败');
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeApi.deleteEmployee(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await employeeApi.updateEmployeeStatus(id, status as CommonStatus);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      await employeeApi.resetEmployeePassword(id, '123456');
      message.success('密码重置成功，默认密码：123456');
    } catch (error) {
      message.error('密码重置失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, values);
        message.success('更新成功');
      } else {
        await employeeApi.createEmployee(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
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
      title: node.departmentName,
      value: node.id,
      children: node.children ? convertTreeData(node.children) : [],
    }));
  };

  const columns: ColumnsType<SysUserListVO> = [
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '部门',
      dataIndex: 'departmentNames',
      key: 'departmentNames',
      render: (names: string[]) => names?.join(', ') || '-',
    },
    {
      title: '角色',
      dataIndex: 'roleNames',
      key: 'roleNames',
      render: (names: string[]) => (
        <Space size={4} wrap>
          {names?.map((name, index) => (
            <Tag key={index} color="blue">{name}</Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定重置密码吗？" onConfirm={() => handleResetPassword(record.id)}>
            <Button type="link" size="small" icon={<LockOutlined />}>重置密码</Button>
          </Popconfirm>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={statusOptions}
          />
          <Popconfirm title="确定删除该员工吗？" onConfirm={() => handleDelete(record.id)}>
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
      title="员工管理"
      subtitle="管理平台内部员工账号和权限"
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
        onSearch={() => handleSearch(searchValues)}
        onReset={handleReset}
        filterCount={filterCount}
      >
        <FormField label="关键词">
          <StyledInput
            isDark={isDarkMode}
            placeholder="姓名/工号/用户名"
            value={searchValues.keyword}
            onChange={e => handleSearchChange('keyword', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="所属部门">
          <TreeSelect
            placeholder="请选择部门"
            treeData={convertTreeData(deptTreeData)}
            value={searchValues.departmentId}
            onChange={v => handleSearchChange('departmentId', v)}
            allowClear
            treeDefaultExpandAll
            style={{ width: '100%' }}
          />
        </FormField>
        <FormField label="状态">
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
      </SearchFilterCard>

      <DataTable<SysUserListVO>
        title="员工列表"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增员工"
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
        title={editingEmployee ? '编辑员工' : '新增员工'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        width={760}
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
                <Col span={8}>
                  <Form.Item name="employeeNo" label="工号" rules={[{ required: true, message: '请输入工号' }]}>
                    <Input placeholder="请输入工号" disabled={!!editingEmployee} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="realName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="请输入用户名" disabled={!!editingEmployee} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                {!editingEmployee && (
                  <Col span={8}>
                    <Form.Item name="password" label="密码">
                      <Input.Password placeholder="默认密码：123456" />
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item name="gender" label="性别">
                    <Select placeholder="请选择性别" options={genderOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="status" label="状态">
                    <Select placeholder="请选择状态" options={statusOptions} />
                  </Form.Item>
                </Col>
                {editingEmployee && (
                  <Col span={8}>
                    <Form.Item name="phone" label="手机号">
                      <Input placeholder="请输入手机号" />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
          <Row gutter={16}>
            {!editingEmployee && (
              <Col span={12}>
                <Form.Item name="phone" label="手机号">
                  <Input placeholder="请输入手机号" />
                </Form.Item>
              </Col>
            )}
            <Col span={editingEmployee ? 24 : 12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="departmentIds" label="所属部门">
                <TreeSelect
                  placeholder="请选择部门"
                  treeData={convertTreeData(deptTreeData)}
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  treeCheckable
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roleIds" label="角色">
                <Select
                  placeholder="请选择角色"
                  mode="multiple"
                  allowClear
                  options={roleOptions.map((role) => ({
                    label: role.roleName,
                    value: role.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default EmployeeManagement;
