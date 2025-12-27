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
  Input,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roleApi } from '../../services/system';
import type { RoleListVO, RoleListParams } from '../../services/system';
import { RoleType, DataScope, CommonStatus } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';

const RoleManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoleListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<RoleListParams>({ page: 1, size: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleListVO | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await roleApi.getRoleList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取角色列表失败');
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
    setSearchValues({});
    setParams({ page: 1, size: 10 });
  };

  const handleEdit = async (record: RoleListVO) => {
    try {
      const res = await roleApi.getRoleById(record.id);
      setEditingRole(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取角色详情失败');
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await roleApi.deleteRole(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await roleApi.updateRoleStatus(id, status as CommonStatus);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleApi.updateRole(editingRole.id, values);
        message.success('更新成功');
      } else {
        await roleApi.createRole(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const roleTypeOptions = [
    { label: '系统角色', value: RoleType.SYSTEM },
    { label: '业务角色', value: RoleType.BUSINESS },
    { label: '自定义角色', value: RoleType.CUSTOM },
  ];

  const dataScopeOptions = [
    { label: '全部数据', value: DataScope.ALL },
    { label: '本部门', value: DataScope.DEPARTMENT },
    { label: '本部门及子部门', value: DataScope.DEPARTMENT_AND_CHILD },
    { label: '仅本人', value: DataScope.SELF },
  ];

  const statusOptions = [
    { label: '禁用', value: CommonStatus.DISABLED },
    { label: '启用', value: CommonStatus.ENABLED },
  ];

  const columns: ColumnsType<RoleListVO> = [
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '角色类型',
      dataIndex: 'roleType',
      key: 'roleType',
      width: 120,
      render: (type: number) => {
        const map: Record<number, { color: string; text: string }> = {
          0: { color: 'red', text: '系统角色' },
          1: { color: 'blue', text: '业务角色' },
          2: { color: 'green', text: '自定义角色' },
        };
        const item = map[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
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
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={statusOptions}
          />
          <Popconfirm title="确定删除该角色吗？" onConfirm={() => handleDelete(record.id)}>
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
      title="角色管理"
      subtitle="管理系统角色和权限分配"
      icon={<SafetyOutlined />}
      breadcrumb={[
        { title: '系统模块' },
        { title: '角色管理' },
      ]}
    >
      <SearchFilterCard
        title="角色筛选"
        subtitle="根据条件快速查找角色"
        icon={<SafetyOutlined />}
        accentColor="#faad14"
        onSearch={() => handleSearch(searchValues)}
        onReset={handleReset}
        filterCount={filterCount}
      >
        <FormField label="关键词">
          <StyledInput
            isDark={isDarkMode}
            placeholder="角色名称/编码"
            value={searchValues.keyword}
            onChange={e => handleSearchChange('keyword', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="角色类型">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择类型"
            value={searchValues.roleType}
            onChange={v => handleSearchChange('roleType', v)}
            options={roleTypeOptions}
            allowClear
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

      <DataTable<RoleListVO>
        title="角色列表"
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增角色"
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
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roleCode" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
                <Input placeholder="请输入角色编码" disabled={!!editingRole} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roleName" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roleType" label="角色类型">
                <Select placeholder="请选择角色类型" options={roleTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dataScope" label="数据范围">
                <Select placeholder="请选择数据范围" options={dataScopeOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" options={statusOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序">
                <Input type="number" placeholder="请输入排序号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="描述">
                <Input.TextArea placeholder="请输入描述" rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default RoleManagement;
