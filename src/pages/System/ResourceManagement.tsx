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
  DatabaseOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import { resourceApi } from '../../services/system';
import type { ResourceListVO, ResourceTreeVO } from '../../services/system';
import { ResourceType, CommonStatus } from '../../services/system';
import { SearchFilterCard, PageContainer, DataTable, FormField, StyledInput, StyledSelect, EnumDisplay, commonStatusConfig, resourceTypeConfig } from '../../components/System';
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
    ? '0 4px 24px rgba(0, 0, 0, 0.25)'
    : '0 2px 16px rgba(0, 0, 0, 0.06)'};
  overflow: hidden;
  height: fit-content;
`;

const TreeContent = styled.div`
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
`;

const ResourceManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchValues, setSearchValues] = useState<Record<string, any>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceListVO | null>(null);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<ResourceTreeVO[]>([]);
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
  } = useTableLocalRefresh<ResourceListVO>({
    primaryKey: 'id',
    spareCount: 5,
    filterValidator: (item, filters) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchCode = item.resourceCode?.toLowerCase().includes(keyword);
        const matchName = item.resourceName?.toLowerCase().includes(keyword);
        if (!matchCode && !matchName) return false;
      }
      if (filters.resourceType !== undefined && item.resourceType !== filters.resourceType) {
        return false;
      }
      if (filters.status !== undefined && item.status !== filters.status) {
        return false;
      }
      return true;
    },
    fetchList: async (params) => {
      const res = await resourceApi.getResourceList(params) as any;
      return res.data;
    },
    deleteItem: async (id) => {
      await resourceApi.deleteResource(id);
    },
    updateItem: async (id, data) => {
      await resourceApi.updateResource(id, data);
      const res = await resourceApi.getResourceById(id) as any;
      return res.data as ResourceListVO;
    },
    createItem: async (data) => {
      await resourceApi.createResource(data as any);
      return null as any;
    },
  });

  const fetchTree = async () => {
    try {
      const res = await resourceApi.getResourceTree();
      setTreeData(res.data || []);
    } catch (error) {
      console.error('获取资源树失败');
    }
  };

  useEffect(() => {
    fetchTree();
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

  const handleEdit = async (record: ResourceListVO) => {
    try {
      const res = await resourceApi.getResourceById(record.id);
      setEditingResource(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleAdd = () => {
    setEditingResource(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await hookHandleDelete(id);
      showSuccessMessage('资源删除成功');
      fetchTree();
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await resourceApi.updateResourceStatus(id, status as CommonStatus);
      showSuccessMessage('资源状态更新成功');
      await hookHandleUpdate(id, { status: status as CommonStatus } as Partial<ResourceListVO>);
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingResource) {
        await hookHandleUpdate(editingResource.id, values);
        showSuccessMessage('资源信息更新成功');
      } else {
        await hookHandleCreate(values);
        showSuccessMessage('资源创建成功');
        refresh();
      }
      setModalVisible(false);
      fetchTree();
    } catch (error) {
      // 错误已由 request 拦截器处理
    }
  };

  const resourceTypeOptions = [
    { label: '菜单', value: ResourceType.MENU },
    { label: '按钮', value: ResourceType.BUTTON },
    { label: 'API', value: ResourceType.API },
    { label: '数据权限', value: ResourceType.DATA_PERMISSION },
  ];

  const statusOptions = [
    { label: '禁用', value: CommonStatus.DISABLED },
    { label: '启用', value: CommonStatus.ENABLED },
  ];

  const convertTreeData = (nodes: ResourceTreeVO[]): any[] => {
    return nodes.map((node) => ({
      title: node.resourceName,
      key: node.id,
      value: node.id,
      children: node.children ? convertTreeData(node.children) : [],
    }));
  };

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    const id = selectedKeys[0] as number | undefined;
    if (id) {
      setSearchValues(prev => ({ ...prev, parentId: id }));
    } else {
      setSearchValues(prev => {
        const { parentId, ...rest } = prev;
        return rest;
      });
    }
  };

  const columns: ColumnsType<ResourceListVO> = [
    {
      title: '资源编码',
      dataIndex: 'resourceCode',
      key: 'resourceCode',
    },
    {
      title: '资源名称',
      dataIndex: 'resourceName',
      key: 'resourceName',
    },
    {
      title: '资源类型',
      dataIndex: 'resourceType',
      key: 'resourceType',
      width: 100,
      render: (type: ResourceType) => (
        <EnumDisplay value={type} config={resourceTypeConfig} size="small" />
      ),
    },
    {
      title: '服务名',
      dataIndex: 'serviceName',
      key: 'serviceName',
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
      title="资源管理"
      subtitle="管理系统菜单、按钮、API等资源权限"
      icon={<DatabaseOutlined />}
      breadcrumb={[
        { title: '系统模块' },
        { title: '资源管理' },
      ]}
      extra={
        <Tooltip title="查看资源结构">
          <Button
            type="text"
            icon={<ClusterOutlined style={{ fontSize: 18, color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }} />}
            onClick={() => setTreeDrawerVisible(true)}
          />
        </Tooltip>
      }
    >
      <SearchFilterCard
        title="资源筛选"
        subtitle="根据条件快速查找资源"
        icon={<DatabaseOutlined />}
        accentColor="#52c41a"
        onSearch={handleSearch}
        onReset={handleReset}
        onRefresh={refresh}
        filterCount={filterCount}
      >
        <FormField label="关键词">
          <StyledInput
            isDark={isDarkMode}
            placeholder="资源名称/编码"
            value={searchValues.keyword}
            onChange={e => handleSearchChange('keyword', e.target.value)}
            allowClear
          />
        </FormField>
        <FormField label="资源类型">
          <StyledSelect
            isDark={isDarkMode}
            placeholder="请选择类型"
            value={searchValues.resourceType}
            onChange={v => handleSearchChange('resourceType', v)}
            options={resourceTypeOptions}
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

      <DataTable<ResourceListVO>
        title="资源列表"
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增资源"
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
            <DatabaseOutlined />
            <span>资源结构</span>
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
        title={editingResource ? '编辑资源' : '新增资源'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        width={720}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="resourceCode" label="资源编码" rules={[{ required: true, message: '请输入资源编码' }]}>
                <Input placeholder="请输入资源编码" disabled={!!editingResource} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="resourceName" label="资源名称" rules={[{ required: true, message: '请输入资源名称' }]}>
                <Input placeholder="请输入资源名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="resourceType" label="资源类型" rules={[{ required: true, message: '请选择资源类型' }]}>
                <Select placeholder="请选择资源类型" options={resourceTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="parentId" label="父级资源">
                <TreeSelect
                  placeholder="请选择父级资源"
                  treeData={convertTreeData(treeData)}
                  allowClear
                  treeDefaultExpandAll
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="serviceName" label="服务名">
                <Input placeholder="请输入服务名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="httpMethod" label="HTTP方法">
                <Select placeholder="请选择HTTP方法" allowClear options={[
                  { label: 'GET', value: 'GET' },
                  { label: 'POST', value: 'POST' },
                  { label: 'PUT', value: 'PUT' },
                  { label: 'DELETE', value: 'DELETE' },
                  { label: 'PATCH', value: 'PATCH' },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="urlPattern" label="URL模式">
                <Input placeholder="请输入URL模式" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
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

export default ResourceManagement;
