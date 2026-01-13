import React, { useState, useMemo } from 'react';
import {
  Button,
  Select,
  Space,
  Modal,
  Form,
  Input,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { showSuccessMessage } from '../../utils/antdStatic';
import {
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { roleApi } from '../../services/system';
import type { RoleListVO } from '../../services/system';
import { RoleType, DataScope, CommonStatus } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, EnumDisplay, commonStatusConfig, roleTypeConfig } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';
import { useTableLocalRefresh } from '../../hooks/useTableLocalRefresh';

const RoleManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleListVO | null>(null);
  const [form] = Form.useForm();

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
  } = useTableLocalRefresh<RoleListVO>({
    primaryKey: 'id',
    spareCount: 5,
    filterValidator: (item, filters) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchCode = item.roleCode?.toLowerCase().includes(keyword);
        const matchName = item.roleName?.toLowerCase().includes(keyword);
        if (!matchCode && !matchName) return false;
      }
      if (filters.roleType !== undefined && item.roleType !== filters.roleType) {
        return false;
      }
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      return true;
    },
    fetchList: async (params) => {
      const res = await roleApi.getRoleList(params) as any;
      return res.data;
    },
    deleteItem: async (id) => {
      await roleApi.deleteRole(id);
    },
    updateItem: async (id, data) => {
      await roleApi.updateRole(id, data);
      const res = await roleApi.getRoleById(id) as any;
      return res.data as RoleListVO;
    },
    createItem: async (data) => {
      await roleApi.createRole(data as any);
      return null as any;
    },
  });

  // 计算活跃筛选条件数量
  const filterCount = useMemo(() => {
    return Object.values(searchValues).filter(v => v !== undefined && v !== '').length;
  }, [searchValues]);

  const handleSearchChange = (key: string, value: any) => {
    setSearchValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    handleFilterChange(searchValues, true);
  };

  const handleReset = () => {
    setSearchValues({});
    handleFilterChange({});
  };

  const handleEdit = async (record: RoleListVO) => {
    try {
      const res = await roleApi.getRoleById(record.id);
      setEditingRole(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await hookHandleDelete(id);
      showSuccessMessage('角色删除成功');
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await roleApi.updateRoleStatus(id, status as CommonStatus);
      showSuccessMessage('角色状态更新成功');
      await hookHandleUpdate(id, { status: status as CommonStatus } as Partial<RoleListVO>);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await hookHandleUpdate(editingRole.id, values);
        showSuccessMessage('角色信息更新成功');
      } else {
        await hookHandleCreate(values);
        showSuccessMessage('角色创建成功');
        refresh();
      }
      setModalVisible(false);
    } catch (error) {
      // 错误已由 request 拦截器处理
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
      render: (type: RoleType) => (
        <EnumDisplay value={type} config={roleTypeConfig} size="small" />
      ),
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
      render: (status: CommonStatus) => (
        <EnumDisplay value={status} config={commonStatusConfig} size="small" />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Select
            size="small"
            value={record.status}
            style={{ width: 80 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={statusOptions}
          />
          <Tooltip title="删除">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];


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
        onSearch={handleSearch}
        onReset={handleReset}
        onRefresh={refresh}
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
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增角色"
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
