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
  DatabaseOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styled from '@emotion/styled';
import { resourceApi } from '../../services/system';
import type { ResourceListVO, ResourceListParams, ResourceTreeVO } from '../../services/system';
import { ResourceType, CommonStatus } from '../../services/system';
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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ResourceListVO[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<ResourceListParams>({ page: 1, size: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceListVO | null>(null);
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState<ResourceTreeVO[]>([]);
  const [treeDrawerVisible, setTreeDrawerVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await resourceApi.getResourceList(params);
      setData(res.data?.records || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTree = async () => {
    try {
      const res = await resourceApi.getResourceTree();
      setTreeData(res.data || []);
    } catch (error) {
      console.error('获取资源树失败');
    }
  };

  useEffect(() => {
    fetchData();
    fetchTree();
  }, [params]);

  const handleSearch = (values: any) => {
    setParams({ ...params, ...values, page: 1 });
  };

  const handleReset = () => {
    setSearchValues({});
    setParams({ page: 1, size: 10 });
  };

  const handleEdit = async (record: ResourceListVO) => {
    try {
      const res = await resourceApi.getResourceById(record.id);
      setEditingResource(record);
      form.setFieldsValue(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error('获取资源详情失败');
    }
  };

  const handleAdd = () => {
    setEditingResource(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await resourceApi.deleteResource(id);
      message.success('删除成功');
      fetchData();
      fetchTree();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleStatusChange = async (id: number, status: number) => {
    try {
      await resourceApi.updateResourceStatus(id, status as CommonStatus);
      message.success('状态更新成功');
      fetchData();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingResource) {
        await resourceApi.updateResource(editingResource.id, values);
        message.success('更新成功');
      } else {
        await resourceApi.createResource(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
      fetchTree();
    } catch (error) {
      message.error('操作失败');
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
      render: (type: number) => {
        const map: Record<number, { color: string; text: string }> = {
          0: { color: 'blue', text: '菜单' },
          1: { color: 'green', text: '按钮' },
          2: { color: 'orange', text: 'API' },
          3: { color: 'purple', text: '数据权限' },
        };
        const item = map[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
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
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>{status === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
          <Popconfirm title="确定删除该资源吗？" onConfirm={() => handleDelete(record.id)}>
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
        onSearch={() => handleSearch(searchValues)}
        onReset={handleReset}
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
        dataSource={data}
        rowKey="id"
        loading={loading}
        onAdd={handleAdd}
        addButtonText="新增资源"
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
