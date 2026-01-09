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
  Tree,
  Input,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import { departmentApi, employeeApi } from '../../services/system';
import type { DepartmentListVO, DepartmentListParams, DepartmentTreeVO, SysUserOptionVO } from '../../services/system';
import { CommonStatus } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect } from '../../components/System';
import { useTheme } from '../../context/ThemeContext';

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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DepartmentListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DepartmentListParams>({ page: 1, size: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentListVO | null>(null);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<DepartmentTreeVO[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [employeeOptions, setEmployeeOptions] = useState<SysUserOptionVO[]>([]);
  const [treeDrawerVisible, setTreeDrawerVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getDepartmentList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  };

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
    fetchData();
    fetchTree();
    fetchEmployeeOptions();
  }, [params]);

  const handleSearch = (values: any) => {
    setParams({ ...params, ...values, page: 1 });
  };

  const handleReset = () => {
    setSearchValues({});
    setParams({ page: 1, size: 10 });
  };

  const handleEdit = async (record: DepartmentListVO) => {
    try {
      const res = await departmentApi.getDepartmentById(record.id);
      setEditingDept(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取部门详情失败');
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
      await departmentApi.deleteDepartment(id);
      message.success('删除成功');
      fetchData();
      fetchTree();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await departmentApi.updateDepartmentStatus(id, status as CommonStatus);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, values);
        message.success('更新成功');
      } else {
        await departmentApi.createDepartment(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
      fetchTree();
    } catch (error) {
      message.error('操作失败');
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
      title: node.departmentName,
      key: node.id,
      value: node.id,
      children: node.children ? convertTreeData(node.children) : [],
    }));
  };

  const columns: ColumnsType<DepartmentListVO> = [
    {
      title: '部门编码',
      dataIndex: 'departmentCode',
      key: 'departmentCode',
    },
    {
      title: '部门名称',
      dataIndex: 'departmentName',
      key: 'departmentName',
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
          <Popconfirm title="确定删除该部门吗？" onConfirm={() => handleDelete(record.id)}>
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
        onSearch={() => handleSearch(searchValues)}
        onReset={handleReset}
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
        dataSource={data}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增部门"
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
              <Form.Item name="departmentCode" label="部门编码" rules={[{ required: true, message: '请输入部门编码' }]}>
                <Input placeholder="请输入部门编码" disabled={!!editingDept} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="departmentName" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]}>
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
