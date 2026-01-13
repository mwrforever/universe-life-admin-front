import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Select,
  Space,
  Modal,
  Form,
  TreeSelect,
  Tree,
  Input,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { showSuccessMessage } from '../../utils/antdStatic';
import {
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import { departmentApi, employeeApi } from '../../services/system';
import type { DepartmentListVO, DepartmentTreeVO, SysUserOptionVO } from '../../services/system';
import { CommonStatus } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, EnumDisplay, commonStatusConfig } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';
import { useTableLocalRefresh } from '../../hooks/useTableLocalRefresh';

const TreeCard = styled.div<{ isDark: boolean }>`
  border-radius: 16px;
  background: ${props => props.isDark
    ? 'rgba(20, 25, 45, 0.95)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${props => props.isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(31, 38, 135, 0.1)'};
  overflow: hidden;
  height: 100%;
`;

const TreeContent = styled.div`
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
`;

const DepartmentManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentListVO | null>(null);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<DepartmentTreeVO[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<SysUserOptionVO[]>([]);
  const [treeDrawerVisible, setTreeDrawerVisible] = useState(false);

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
  } = useTableLocalRefresh<DepartmentListVO>({
    primaryKey: 'id',
    spareCount: 5,
    filterValidator: (item, filters) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchCode = item.deptCode?.toLowerCase().includes(keyword);
        const matchName = item.deptName?.toLowerCase().includes(keyword);
        if (!matchCode && !matchName) return false;
      }
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      return true;
    },
    fetchList: async (params) => {
      const res = await departmentApi.getDepartmentList(params) as any;
      return res.data;
    },
    deleteItem: async (id) => {
      await departmentApi.deleteDepartment(id);
    },
    updateItem: async (id, data) => {
      await departmentApi.updateDepartment(id, data);
      const res = await departmentApi.getDepartmentById(id) as any;
      return res.data as DepartmentListVO;
    },
    createItem: async (data) => {
      await departmentApi.createDepartment(data as any);
      return null as any;
    },
  });

  const fetchTree = async () => {
    try {
      const res = await departmentApi.getDepartmentTree();
      setTreeData(res.data || []);
    } catch (error) {
      console.error('获取部门树失败');
    }
  };

  const fetchEmployeeOptions = async () => {
    try {
      const res = await employeeApi.getEmployeeOptions();
      setEmployeeOptions(res.data || []);
    } catch (error) {
      console.error('获取员工选项失败');
    }
  };

  useEffect(() => {
    fetchTree();
    fetchEmployeeOptions();
  }, []);

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

  const handleEdit = async (record: DepartmentListVO) => {
    try {
      const res = await departmentApi.getDepartmentById(record.id);
      setEditingDept(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleAdd = () => {
    setEditingDept(null);
    form.resetFields();
    if (selectedDeptId) {
      form.setFieldsValue({ parentId: selectedDeptId });
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await hookHandleDelete(id);
      showSuccessMessage('部门删除成功');
      fetchTree();
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await departmentApi.updateDepartmentStatus(id, status as CommonStatus);
      showSuccessMessage('部门状态更新成功');
      await hookHandleUpdate(id, { status: status as CommonStatus } as Partial<DepartmentListVO>);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingDept) {
        await hookHandleUpdate(editingDept.id, values);
        showSuccessMessage('部门信息更新成功');
      } else {
        await hookHandleCreate(values);
        showSuccessMessage('部门创建成功');
        refresh();
      }
      setModalVisible(false);
      fetchTree();
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    const id = selectedKeys[0] as number | undefined;
    setSelectedDeptId(id || null);
  };

  const statusOptions = [
    { label: '禁用', value: CommonStatus.DISABLED },
    { label: '启用', value: CommonStatus.ENABLED },
  ];

  const convertTreeData = (nodes: DepartmentTreeVO[]): any[] => {
    return nodes.map((node) => ({
      title: node.deptName,
      key: node.id,
      value: node.id,
      children: node.children ? convertTreeData(node.children) : [],
    }));
  };

  const columns: ColumnsType<DepartmentListVO> = [
    {
      title: '部门编码',
      dataIndex: 'deptCode',
      key: 'deptCode',
    },
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
    },
    {
      title: '上级部门',
      dataIndex: 'parentName',
      key: 'parentName',
      render: (text: string) => text || '-',
    },
    {
      title: '负责人',
      dataIndex: 'leaderName',
      key: 'leaderName',
      render: (text: string) => text || '-',
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
      title="部门管理"
      subtitle="管理组织架构和部门信息"
      icon={<ApartmentOutlined />}
      breadcrumb={[
        { title: '系统模块' },
        { title: '部门管理' },
      ]}
      extra={
        <Tooltip title="查看组织架构">
          <Button
            type="text"
            icon={<PartitionOutlined style={{ fontSize: 18, color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }} />}
            onClick={() => setTreeDrawerVisible(true)}
          />
        </Tooltip>
      }
    >
      <SearchFilterCard
        title="部门筛选"
        subtitle="根据条件快速查找部门"
        icon={<ApartmentOutlined />}
        accentColor="#1677ff"
        onSearch={handleSearch}
        onReset={handleReset}
        onRefresh={refresh}
        filterCount={filterCount}
      >
        <FormField label="部门名称">
          <StyledInput
            isDark={isDarkMode}
            placeholder="请输入部门名称"
            value={searchValues.keyword}
            onChange={e => handleSearchChange('keyword', e.target.value)}
            allowClear
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

      <DataTable<DepartmentListVO>
        title="部门列表"
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增部门"
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
        title={
          <Space>
            <ApartmentOutlined />
            <span>组织架构</span>
          </Space>
        }
        open={treeDrawerVisible}
        onCancel={() => setTreeDrawerVisible(false)}
        footer={null}
        width={480}
        centered
      >
        <TreeCard isDark={isDarkMode} style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
          <TreeContent style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Tree
              treeData={convertTreeData(treeData)}
              onSelect={handleTreeSelect}
              defaultExpandAll
            />
          </TreeContent>
        </TreeCard>
      </Modal>

      <Modal
        title={editingDept ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deptCode" label="部门编码" rules={[{ required: true, message: '请输入部门编码' }]}>
                <Input placeholder="请输入部门编码" disabled={!!editingDept} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deptName" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parentId" label="上级部门">
                <TreeSelect
                  placeholder="请选择上级部门"
                  treeData={convertTreeData(treeData)}
                  allowClear
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leaderId" label="负责人">
                <Select
                  placeholder="请选择负责人"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={employeeOptions.map((emp) => ({
                    label: emp.realName,
                    value: emp.id,
                  }))}
                />
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

export default DepartmentManagement;
