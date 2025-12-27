/**
 * Universe Life Admin - 交易订单中心
 *
 * 企业级交易订单管理解决方案
 * 基于 ProTable + Drawer + ProDescription + Steps 的复杂业务页面展示
 *
 * 功能特性：
 * - 高级数据表格 (ProTable) 展示订单列表
 * - 详情抽屉 (Drawer) 展示订单完整信息
 * - 订单状态流程 (Steps) 可视化订单流转
 * - 信息区块 (ProDescription) 展示详细信息
 * - 商品清单嵌套表格
 * - 深色模式优化的状态标签
 *
 * @author James
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, ProCard, ProDescriptions } from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  Tag,
  Space,
  Typography,
  message,
  Tooltip,
  Badge,
  Avatar,
  Statistic,
  Row,
  Col,
  Steps,
  Table,
  Divider,
  Alert,
  Progress,
  Image,
  Timeline,
  Popover,
  Dropdown,
} from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  ExportOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  UserOutlined,
  PayCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  TruckOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

// 导入类型和数据
import {
  type Order,
  OrderStatus,
  PaymentMethod,
  OrderType,
  LogisticsStatus,
  type OrderQueryParams,
  type OrderListResponse,
  type Address
} from '../../types/trade/index';
import { mockGetOrderList } from '../../data/mockOrders';

const { Text, Title } = Typography;
const { Step } = Steps;

// 订单状态配置 - 包含深色模式适配
const orderStatusConfig = {
  [OrderStatus.CREATED]: {
    text: '已创建',
    color: 'default' as const,
    icon: <ClockCircleOutlined />,
    step: 0,
    themeDark: '#595959' // 深色模式下更暗的颜色
  },
  [OrderStatus.PENDING_PAYMENT]: {
    text: '待支付',
    color: 'processing' as const,
    icon: <PayCircleOutlined />,
    step: 1,
    themeDark: '#1890ff' // 深色模式下偏暗的蓝色
  },
  [OrderStatus.PAID]: {
    text: '已支付',
    color: 'blue' as const,
    icon: <CheckCircleOutlined />,
    step: 2,
    themeDark: '#1e40af' // 深色模式下偏暗的蓝色
  },
  [OrderStatus.PROCESSING]: {
    text: '处理中',
    color: 'cyan' as const,
    icon: <ClockCircleOutlined />,
    step: 2,
    themeDark: '#0891b2' // 深色模式下偏暗的青色
  },
  [OrderStatus.SHIPPED]: {
    text: '已发货',
    color: 'orange' as const,
    icon: <TruckOutlined />,
    step: 3,
    themeDark: '#c2410c' // 深色模式下偏暗的橙色
  },
  [OrderStatus.DELIVERED]: {
    text: '已送达',
    color: 'geekblue' as const,
    icon: <EnvironmentOutlined />,
    step: 4,
    themeDark: '#1e3a8a' // 深色模式下偏暗的深蓝色
  },
  [OrderStatus.COMPLETED]: {
    text: '已完成',
    color: 'success' as const,
    icon: <CheckCircleOutlined />,
    step: 4,
    themeDark: '#166534' // 深色模式下偏暗的绿色
  },
  [OrderStatus.CANCELLED]: {
    text: '已取消',
    color: 'error' as const,
    icon: <CloseCircleOutlined />,
    step: -1,
    themeDark: '#991b1b' // 深色模式下偏暗的红色
  },
  [OrderStatus.REFUNDED]: {
    text: '已退款',
    color: 'warning' as const,
    icon: <WarningOutlined />,
    step: -1,
    themeDark: '#a16207' // 深色模式下偏暗的黄色
  },
  [OrderStatus.DISPUTED]: {
    text: '争议中',
    color: 'magenta' as const,
    icon: <ExclamationCircleOutlined />,
    step: -1,
    themeDark: '#9333ea' // 深色模式下偏暗的紫色
  }
};

// 支付方式配置
const paymentMethodConfig = {
  [PaymentMethod.ALIPAY]: { text: '支付宝', color: '#1677FF', icon: '💰' },
  [PaymentMethod.WECHAT]: { text: '微信支付', color: '#52C41A', icon: '💚' },
  [PaymentMethod.BANK_CARD]: { text: '银行卡', color: '#722ED1', icon: '💳' },
  [PaymentMethod.BALANCE]: { text: '余额支付', color: '#FA541C', icon: '🪙' },
  [PaymentMethod.CREDIT]: { text: '信用支付', color: '#13C2C2', icon: '💎' },
  [PaymentMethod.CRYPTOCURRENCY]: { text: '数字货币', color: '#FAAD14', icon: '₿' }
};

// 订单类型配置
const orderTypeConfig = {
  [OrderType.PURCHASE]: { text: '购买订单', color: 'blue' },
  [OrderType.SUBSCRIPTION]: { text: '订阅订单', color: 'green' },
  [OrderType.SERVICE]: { text: '服务订单', color: 'orange' },
  [OrderType.VIRTUAL]: { text: '虚拟商品', color: 'purple' },
  [OrderType.PHYSICAL]: { text: '实物商品', color: 'cyan' }
};

// 获取当前步骤状态
const getCurrentStep = (status: OrderStatus): number => {
  const config = orderStatusConfig[status];
  return config ? config.step : 0;
};

export const TradeOrderCenter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);

  // 处理查看订单详情
  const handleViewOrderDetail = async (record: Order) => {
    setSelectedOrder(record);
    setDetailDrawerVisible(true);
  };

  // 复制订单号
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    message.success('订单号已复制到剪贴板');
  };

  // 格式化货币
  const formatCurrency = (amount: number, currency: string = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 获取状态标签的样式（深色模式适配）
  const getStatusTagStyle = (status: OrderStatus) => {
    const config = orderStatusConfig[status];
    if (!config) return {};

    return {
      backgroundColor: isDarkMode ? `${config.themeDark}20` : undefined,
      borderColor: isDarkMode ? config.themeDark : undefined,
      color: isDarkMode ? config.themeDark : undefined,
    };
  };

  // 表格列定义
  const columns: ProColumns<Order>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      width: 180,
      render: (_, record) => (
        <Space size={4}>
          <Text strong style={{
            color: isDarkMode ? '#fff' : '#262626',
            fontFamily: 'Consolas, Monaco, monospace'
          }}>
            {record.orderNumber}
          </Text>
          <Tooltip title="复制订单号">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyOrderNumber(record.orderNumber)}
              style={{
                color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
                padding: '0 4px'
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '买家信息',
      dataIndex: 'buyerInfo',
      width: 200,
      hideInSearch: true,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            size="small"
            src={record.buyerAvatar}
            style={{
              backgroundColor: '#5B50FF',
              border: isDarkMode ? '1px solid rgba(91, 80, 255, 0.3)' : 'none'
            }}
          >
            {record.buyerName[0]}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 500,
              color: isDarkMode ? '#fff' : '#262626',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {record.buyerName}
            </div>
            <div style={{
              fontSize: 12,
              color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {record.buyerEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '商品信息',
      dataIndex: 'itemsInfo',
      width: 300,
      hideInSearch: true,
      render: (_, record) => (
        <div>
          <div style={{
            fontWeight: 500,
            color: isDarkMode ? '#fff' : '#262626',
            marginBottom: 4
          }}>
            {record.items[0]?.productName}
          </div>
          {record.itemCount > 1 && (
            <div style={{
              fontSize: 12,
              color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
            }}>
              等 {record.itemCount} 件商品
            </div>
          )}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      width: 140,
      hideInSearch: true,
      render: (_, record) => (
        <Text strong style={{
          color: record.totalAmount > 10000 ? '#ff4d4f' : (isDarkMode ? '#fff' : '#262626'),
          fontSize: 16
        }}>
          {formatCurrency(record.totalAmount)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      width: 120,
      filters: true,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(orderStatusConfig).map(([key, value]) => [key, value.text])
      ),
      render: (_, record) => {
        const config = orderStatusConfig[record.status];
        if (!config) return null;

        return (
          <Tag
            color={config.color}
            icon={config.icon}
            style={getStatusTagStyle(record.status)}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      width: 120,
      filters: true,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(paymentMethodConfig).map(([key, value]) => [key, value.text])
      ),
      render: (_, record) => {
        if (!record.paymentInfo) return <Tag color="default">未支付</Tag>;

        const config = paymentMethodConfig[record.paymentInfo.method];
        return (
          <Tag style={{ backgroundColor: isDarkMode ? `${config.color}20` : undefined }}>
            <span style={{ marginRight: 4 }}>{config.icon}</span>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      width: 120,
      filters: true,
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(orderTypeConfig).map(([key, value]) => [key, value.text])
      ),
      render: (_, record) => {
        const config = orderTypeConfig[record.type];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 160,
      sorter: true,
      render: (_, record) => (
        <div>
          <div style={{
            color: isDarkMode ? '#fff' : '#262626'
          }}>
            {new Date(record.createdAt).toLocaleDateString('zh-CN')}
          </div>
          <div style={{
            fontSize: 12,
            color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
          }}>
            {new Date(record.createdAt).toLocaleTimeString('zh-CN')}
          </div>
        </div>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      width: 100,
      filters: true,
      valueType: 'select',
      valueEnum: {
        low: '低风险',
        medium: '中风险',
        high: '高风险'
      },
      render: (_, record) => {
        const riskColors = {
          low: { color: 'success', text: '低风险' },
          medium: { color: 'warning', text: '中风险' },
          high: { color: 'error', text: '高风险' }
        };
        const config = riskColors[record.riskLevel];

        return (
          <Tag
            color={config.color}
            style={isDarkMode ? { opacity: 0.8 } : {}}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewOrderDetail(record)}
              style={{
                color: isDarkMode ? '#8c8c8c' : '#262626'
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'export',
                  label: '导出订单',
                  icon: <DownloadOutlined />,
                  onClick: () => message.info(`导出订单 ${record.orderNumber}`)
                },
                {
                  key: 'print',
                  label: '打印订单',
                  icon: <PrinterOutlined />,
                  onClick: () => message.info(`打印订单 ${record.orderNumber}`)
                },
                {
                  type: 'divider',
                },
                {
                  key: 'edit',
                  label: '编辑订单',
                  icon: <EditOutlined />,
                  onClick: () => message.info(`编辑订单 ${record.orderNumber}`)
                },
                {
                  key: 'cancel',
                  label: '取消订单',
                  danger: true,
                  onClick: () => {
                    if (record.status === OrderStatus.PENDING_PAYMENT) {
                      message.success(`取消订单 ${record.orderNumber}`);
                    } else {
                      message.warning('该订单状态不允许取消');
                    }
                  }
                }
              ]
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              style={{
                color: isDarkMode ? '#8c8c8c' : '#262626'
              }}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{
      background: isDarkMode ? '#000000' : '#f5f5f7',
      minHeight: '100vh',
      padding: 0
    }}>
      <ProCard
        bordered={false}
        style={{
          background: isDarkMode ? '#141414' : '#ffffff',
          margin: 0,
          borderRadius: 0,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <ProTable<Order>
          columns={columns}
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            filterType: 'light',
            collapseRender: (collapsed) =>
              collapsed ? '展开筛选' : '收起筛选'
          }}
          request={async (params, sort, filter) => {
            const response = await mockGetOrderList({
              current: params.current,
              pageSize: params.pageSize,
              keyword: params.orderNumber,
              status: filter.status as OrderStatus | OrderStatus[],
              type: filter.type as OrderType | OrderType[],
              paymentMethod: filter.paymentMethod as PaymentMethod | PaymentMethod[],
              riskLevel: filter.riskLevel as ('low' | 'medium' | 'high')[],
              createdAtStart: params.createdAtRange?.[0],
              createdAtEnd: params.createdAtRange?.[1],
              minAmount: params.amountRange?.[0],
              maxAmount: params.amountRange?.[1],
              sortField: sort.field,
              sortOrder: sort.order as 'asc' | 'desc' | undefined,
            });
            return response;
          }}
          columnsState={{
            persistenceKey: 'trade-orders-table',
            persistenceType: 'localStorage',
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
            <Space size={24}>
              <span>
                已选择 <a style={{
                  fontWeight: 600,
                  color: isDarkMode ? '#fff' : '#262626'
                }}>{selectedRowKeys.length}</a> 项
                &nbsp;&nbsp;
                <Button
                  type="link"
                  size="small"
                  onClick={onCleanSelected}
                  style={{ color: isDarkMode ? '#5B50FF' : '#5B50FF' }}
                >
                  取消选择
                </Button>
              </span>
            </Space>
          )}
          tableAlertOptionRender={() => (
            <Space size={16}>
              <a>批量导出</a>
              <a>批量打印</a>
              <a>批量发货</a>
              <Dropdown
                menu={{
                  items: [
                    { key: 'cancel', label: '批量取消', danger: true },
                    { key: 'refund', label: '批量退款', danger: true },
                    { key: 'mark-suspicious', label: '标记为可疑' },
                  ]
                }}
              >
                <a>更多操作</a>
              </Dropdown>
            </Space>
          )}
          toolBarRender={() => [
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => actionRef.current?.reload()}
              style={{
                borderColor: isDarkMode ? '#434343' : undefined,
                color: isDarkMode ? '#fff' : '#262626'
              }}
            >
              刷新
            </Button>,
            <Button
              key="export"
              icon={<ExportOutlined />}
              onClick={() => {
                message.info('导出功能开发中...');
              }}
              style={{
                borderColor: isDarkMode ? '#434343' : undefined,
                color: isDarkMode ? '#fff' : '#262626'
              }}
            >
              导出数据
            </Button>
          ]}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
          }}
          dateFormatter="string"
          headerTitle="交易订单管理"
          headerSubtitle={`共 ${selectedRowKeys.length > 0 ? `${selectedRowKeys.length} 项已选择` : '全部订单'}`}
          options={{
            setting: {
              listsHeight: 400,
            },
            reload: () => actionRef.current?.reload(),
            density: true,
            fullScreen: true,
          }}
          size="middle"
          scroll={{ x: 1600 }}
          onRow={(record) => ({
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? 'rgba(91, 80, 255, 0.05)'
                : 'rgba(91, 80, 255, 0.02)';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = '';
            },
          })}
          rowClassName={(_, index) =>
            index % 2 === 1
              ? isDarkMode
                ? 'zebra-row-dark'
                : 'zebra-row-light'
              : ''
          }
        />
      </ProCard>

      {/* 订单详情抽屉 */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingOutlined />
            <span>订单详情 - {selectedOrder?.orderNumber}</span>
          </div>
        }
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        styles={{
          body: {
            background: isDarkMode ? '#000000' : '#ffffff',
            padding: 0
          },
          header: {
            background: isDarkMode ? '#141414' : '#ffffff',
            borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`
          }
        }}
        extra={
          <Space>
            <Button
              icon={<PrintOutlined />}
              onClick={() => message.info('打印订单')}
            >
              打印
            </Button>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={() => message.info('导出订单')}
            >
              导出
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <div style={{ padding: 24 }}>
            {/* 订单状态流程 */}
            <ProCard
              title="订单状态"
              bordered={false}
              style={{
                marginBottom: 16,
                background: isDarkMode ? '#141414' : '#fafafa'
              }}
              headStyle={{
                background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
              }}
            >
              <Steps
                current={getCurrentStep(selectedOrder.status)}
                size="small"
                items={[
                  {
                    title: '创建订单',
                    description: new Date(selectedOrder.createdAt).toLocaleString('zh-CN'),
                    icon: <ClockCircleOutlined />,
                    status: getCurrentStep(selectedOrder.status) >= 0 ? 'finish' : 'wait'
                  },
                  {
                    title: '支付完成',
                    description: selectedOrder.paidAt
                      ? new Date(selectedOrder.paidAt).toLocaleString('zh-CN')
                      : '待支付',
                    icon: <PayCircleOutlined />,
                    status: getCurrentStep(selectedOrder.status) >= 1 ? 'finish' :
                           (selectedOrder.status === OrderStatus.CANCELLED ? 'error' : 'wait')
                  },
                  {
                    title: '发货处理',
                    description: selectedOrder.shippedAt
                      ? new Date(selectedOrder.shippedAt).toLocaleString('zh-CN')
                      : '待发货',
                    icon: <TruckOutlined />,
                    status: getCurrentStep(selectedOrder.status) >= 2 ? 'finish' : 'wait'
                  },
                  {
                    title: '订单完成',
                    description: selectedOrder.completedAt
                      ? new Date(selectedOrder.completedAt).toLocaleString('zh-CN')
                      : '处理中',
                    icon: <CheckCircleOutlined />,
                    status: getCurrentStep(selectedOrder.status) >= 4 ? 'finish' : 'wait'
                  }
                ]}
              />
            </ProCard>

            {/* 订单统计信息 */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic
                  title="订单金额"
                  value={selectedOrder.totalAmount}
                  precision={2}
                  prefix="¥"
                  valueStyle={{
                    color: isDarkMode ? '#fff' : '#3f8600'
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="商品数量"
                  value={selectedOrder.itemCount}
                  suffix="件"
                  valueStyle={{
                    color: isDarkMode ? '#fff' : '#1890ff'
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="物流状态"
                  value={selectedOrder.logisticsInfo?.status || '待发货'}
                  valueStyle={{
                    color: isDarkMode ? '#fff' : '#722ed1'
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="风险评分"
                  value={selectedOrder.fraudScore}
                  precision={0}
                  suffix="/ 100"
                  valueStyle={{
                    color: selectedOrder.riskLevel === 'high' ? '#ff4d4f' :
                           selectedOrder.riskLevel === 'medium' ? '#faad14' :
                           isDarkMode ? '#fff' : '#52c41a'
                  }}
                />
              </Col>
            </Row>

            {/* 基本信息 */}
            <ProCard
              title="基本信息"
              bordered={false}
              style={{
                marginBottom: 16,
                background: isDarkMode ? '#141414' : '#fafafa'
              }}
              headStyle={{
                background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
              }}
            >
              <ProDescriptions
                column={2}
                bordered
                labelStyle={{
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
                  color: isDarkMode ? '#8c8c8c' : '#595959',
                  width: '30%'
                }}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                  color: isDarkMode ? '#fff' : '#262626'
                }}
              >
                <ProDescriptions.Item label="订单号">{selectedOrder.orderNumber}</ProDescriptions.Item>
                <ProDescriptions.Item label="订单类型">
                  <Tag color={orderTypeConfig[selectedOrder.type].color}>
                    {orderTypeConfig[selectedOrder.type].text}
                  </Tag>
                </ProDescriptions.Item>
                <ProDescriptions.Item label="订单状态">
                  <Tag
                    color={orderStatusConfig[selectedOrder.status].color}
                    icon={orderStatusConfig[selectedOrder.status].icon}
                    style={getStatusTagStyle(selectedOrder.status)}
                  >
                    {orderStatusConfig[selectedOrder.status].text}
                  </Tag>
                </ProDescriptions.Item>
                <ProDescriptions.Item label="创建时间">
                  {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="支付方式">
                  {selectedOrder.paymentInfo ? (
                    <Tag>
                      <span style={{ marginRight: 4 }}>
                        {paymentMethodConfig[selectedOrder.paymentInfo.method].icon}
                      </span>
                      {paymentMethodConfig[selectedOrder.paymentInfo.method].text}
                    </Tag>
                  ) : (
                    <Tag color="default">未支付</Tag>
                  )}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="支付时间">
                  {selectedOrder.paidAt
                    ? new Date(selectedOrder.paidAt).toLocaleString('zh-CN')
                    : '-'
                  }
                </ProDescriptions.Item>
                <ProDescriptions.Item label="优惠金额">
                  {selectedOrder.discount > 0
                    ? `¥${selectedOrder.discount.toFixed(2)}`
                    : '无'
                  }
                </ProDescriptions.Item>
                <ProDescriptions.Item label="用户备注">
                  {selectedOrder.buyerNotes || '-'}
                </ProDescriptions.Item>
              </ProDescriptions>
            </ProCard>

            {/* 买家信息 */}
            <ProCard
              title="买家信息"
              bordered={false}
              style={{
                marginBottom: 16,
                background: isDarkMode ? '#141414' : '#fafafa'
              }}
              headStyle={{
                background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Avatar
                  size={64}
                  src={selectedOrder.buyerAvatar}
                  style={{
                    backgroundColor: '#5B50FF',
                    border: isDarkMode ? '2px solid rgba(91, 80, 255, 0.3)' : 'none'
                  }}
                >
                  {selectedOrder.buyerName[0]}
                </Avatar>
                <div>
                  <Title level={4} style={{
                    margin: 0,
                    color: isDarkMode ? '#fff' : '#262626'
                  }}>
                    {selectedOrder.buyerName}
                  </Title>
                  <div style={{
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c',
                    marginBottom: 4
                  }}>
                    {selectedOrder.buyerEmail}
                  </div>
                  <div style={{
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    {selectedOrder.buyerPhone}
                  </div>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <ProDescriptions
                  column={1}
                  bordered
                  title="收货地址"
                  labelStyle={{
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
                    color: isDarkMode ? '#8c8c8c' : '#595959',
                    width: '20%'
                  }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                    color: isDarkMode ? '#fff' : '#262626'
                  }}
                >
                  <ProDescriptions.Item label="收货人">
                    {selectedOrder.shippingAddress.receiverName}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="联系电话">
                    {selectedOrder.shippingAddress.receiverPhone}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="详细地址">
                    {selectedOrder.shippingAddress.province}
                    {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.district}
                    {selectedOrder.shippingAddress.detailedAddress}
                  </ProDescriptions.Item>
                </ProDescriptions>
              )}
            </ProCard>

            {/* 物流信息 */}
            {selectedOrder.logisticsInfo && (
              <ProCard
                title="物流信息"
                bordered={false}
                style={{
                  marginBottom: 16,
                  background: isDarkMode ? '#141414' : '#fafafa'
                }}
                headStyle={{
                  background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                  borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
                }}
              >
                <ProDescriptions
                  column={2}
                  bordered
                  labelStyle={{
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa',
                    color: isDarkMode ? '#8c8c8c' : '#595959',
                    width: '25%'
                  }}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                    color: isDarkMode ? '#fff' : '#262626'
                  }}
                >
                  <ProDescriptions.Item label="物流公司">
                    {selectedOrder.logisticsInfo.carrier}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="运单号">
                    <Space>
                      <Text code>{selectedOrder.logisticsInfo.trackingNumber}</Text>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => window.open(selectedOrder.logisticsInfo.trackingUrl, '_blank')}
                      >
                        查看轨迹
                      </Button>
                    </Space>
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="发货时间">
                    {new Date(selectedOrder.logisticsInfo.shippedAt).toLocaleString('zh-CN')}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="预计送达">
                    {new Date(selectedOrder.logisticsInfo.estimatedDeliveryAt).toLocaleString('zh-CN')}
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="物流状态">
                    <Tag color="blue">
                      {selectedOrder.logisticsInfo.status === LogisticsStatus.PENDING && '待发货'}
                      {selectedOrder.logisticsInfo.status === LogisticsStatus.SHIPPED && '已发货'}
                      {selectedOrder.logisticsInfo.status === LogisticsStatus.IN_TRANSIT && '运输中'}
                      {selectedOrder.logisticsInfo.status === LogisticsStatus.OUT_FOR_DELIVERY && '派送中'}
                      {selectedOrder.logisticsInfo.status === LogisticsStatus.DELIVERED && '已送达'}
                    </Tag>
                  </ProDescriptions.Item>
                  <ProDescriptions.Item label="备注">
                    {selectedOrder.logisticsInfo.notes || '-'}
                  </ProDescriptions.Item>
                </ProDescriptions>

                {/* 物流时间线 */}
                <div style={{ marginTop: 16 }}>
                  <Title level={5} style={{
                    marginBottom: 16,
                    color: isDarkMode ? '#fff' : '#262626'
                  }}>
                    物流轨迹
                  </Title>
                  <Timeline
                    items={selectedOrder.logisticsInfo?.timeline.map((item, index) => ({
                      key: index,
                      color: index === (selectedOrder.logisticsInfo?.timeline.length ?? 0) - 1 ? 'blue' : 'gray',
                      children: (
                        <div>
                          <div style={{
                            fontWeight: 500,
                            color: isDarkMode ? '#fff' : '#262626'
                          }}>
                            {item.status}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                          }}>
                            {item.description}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: isDarkMode ? '#595959' : '#bfbfbf'
                          }}>
                            {item.location}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: isDarkMode ? '#595959' : '#bfbfbf'
                          }}>
                            {new Date(item.time).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      )
                    }))}
                  />
                </div>
              </ProCard>
            )}

            {/* 商品清单 */}
            <ProCard
              title="商品清单"
              bordered={false}
              style={{
                marginBottom: 16,
                background: isDarkMode ? '#141414' : '#fafafa'
              }}
              headStyle={{
                background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
              }}
            >
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '商品图片',
                    dataIndex: 'productImage',
                    width: 80,
                    render: (url) => (
                      <Image
                        width={40}
                        height={40}
                        src={url}
                        preview={false}
                        style={{ borderRadius: 4 }}
                      />
                    )
                  },
                  {
                    title: '商品信息',
                    dataIndex: 'productName',
                    render: (_, record) => (
                      <div>
                        <div style={{
                          fontWeight: 500,
                          color: isDarkMode ? '#fff' : '#262626',
                          marginBottom: 4
                        }}>
                          {record.productName}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                        }}>
                          SKU: {record.sku}
                        </div>
                        {record.specifications && (
                          <div style={{
                            fontSize: 12,
                            color: isDarkMode ? '#595959' : '#bfbfbf'
                          }}>
                            {record.specifications.version} • {record.specifications.duration}
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    title: '单价',
                    dataIndex: 'unitPrice',
                    width: 100,
                    render: (price) => (
                      <Text style={{
                        color: isDarkMode ? '#fff' : '#262626'
                      }}>
                        ¥{price.toFixed(2)}
                      </Text>
                    )
                  },
                  {
                    title: '数量',
                    dataIndex: 'quantity',
                    width: 80,
                    render: (quantity) => (
                      <Text style={{
                        color: isDarkMode ? '#fff' : '#262626'
                      }}>
                        {quantity}
                      </Text>
                    )
                  },
                  {
                    title: '小计',
                    dataIndex: 'totalPrice',
                    width: 100,
                    render: (total) => (
                      <Text strong style={{
                        color: isDarkMode ? '#fff' : '#262626'
                      }}>
                        ¥{total.toFixed(2)}
                      </Text>
                    )
                  }
                ]}
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Text strong>合计</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong style={{ fontSize: 16 }}>
                        {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} 件
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong style={{
                        fontSize: 16,
                        color: isDarkMode ? '#fff' : '#262626'
                      }}>
                        ¥{selectedOrder.subtotal.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </ProCard>

            {/* 费用明细 */}
            <ProCard
              title="费用明细"
              bordered={false}
              style={{
                background: isDarkMode ? '#141414' : '#fafafa'
              }}
              headStyle={{
                background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    <span>商品小计</span>
                    <span style={{ color: isDarkMode ? '#fff' : '#262626' }}>
                      ¥{selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    <span>运费</span>
                    <span style={{ color: isDarkMode ? '#fff' : '#262626' }}>
                      ¥{selectedOrder.shippingFee.toFixed(2)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    <span>税费</span>
                    <span style={{ color: isDarkMode ? '#fff' : '#262626' }}>
                      ¥{selectedOrder.tax.toFixed(2)}
                    </span>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                  }}>
                    <span>优惠金额</span>
                    <span style={{ color: '#ff4d4f' }}>
                      -¥{selectedOrder.discount.toFixed(2)}
                    </span>
                  </div>
                  {selectedOrder.refundAmount && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                    }}>
                      <span>退款金额</span>
                      <span style={{ color: '#ff4d4f' }}>
                        -¥{selectedOrder.refundAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <Divider />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}>
                    <span style={{ color: isDarkMode ? '#fff' : '#262626' }}>
                      订单总额
                    </span>
                    <span style={{
                      color: '#ff4d4f',
                      fontSize: 18
                    }}>
                      ¥{selectedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Col>
              </Row>
            </ProCard>

            {/* 风险提示 */}
            {selectedOrder.isSuspicious && (
              <Alert
                message="高风险订单"
                description={`欺诈风险评分: ${selectedOrder.fraudScore}/100，建议人工审核`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* 备注信息 */}
            {(selectedOrder.sellerNotes || selectedOrder.internalNotes) && (
              <ProCard
                title="备注信息"
                bordered={false}
                style={{
                  background: isDarkMode ? '#141414' : '#fafafa'
                }}
                headStyle={{
                  background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                  borderBottom: `1px solid ${isDarkMode ? '#303030' : '#e8e8e8'}`
                }}
              >
                {selectedOrder.sellerNotes && (
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{
                      color: isDarkMode ? '#8c8c8c' : '#595959'
                    }}>
                      商家备注：
                    </Text>
                    <div style={{
                      marginTop: 4,
                      padding: 8,
                      background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                      borderRadius: 4,
                      color: isDarkMode ? '#fff' : '#262626'
                    }}>
                      {selectedOrder.sellerNotes}
                    </div>
                  </div>
                )}
                {selectedOrder.internalNotes && (
                  <div>
                    <Text strong style={{
                      color: isDarkMode ? '#8c8c8c' : '#595959'
                    }}>
                      内部备注：
                    </Text>
                    <div style={{
                      marginTop: 4,
                      padding: 8,
                      background: isDarkMode ? '#1a1a1a' : '#fff0f6',
                      borderRadius: 4,
                      color: isDarkMode ? '#fff' : '#262626'
                    }}>
                      {selectedOrder.internalNotes}
                    </div>
                  </div>
                )}
              </ProCard>
            )}
          </div>
        )}
      </Drawer>

      {/* 自定义样式 */}
      <style>{`
        .zebra-row-light {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .zebra-row-dark {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .ant-table-tbody > tr:hover > td {
          background-color: ${isDarkMode
            ? 'rgba(91, 80, 255, 0.08) !important'
            : 'rgba(91, 80, 255, 0.04) !important'
          };
        }
        .ant-pro-table-search {
          padding: 24px;
          background: ${isDarkMode ? '#1a1a1a' : '#fafafa'};
          border-bottom: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
        }
        .ant-pro-table-list-toolbar-title {
          color: ${isDarkMode ? '#fff' : '#141414'} !important;
        }
        .ant-pro-table-list-toolbar {
          padding: 16px 24px;
          background: ${isDarkMode ? '#141414' : '#ffffff'};
        }
        .ant-table-thead > tr > th {
          background: ${isDarkMode ? '#1a1a1a' : '#fafafa'} !important;
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.88)'} !important;
          font-weight: 600;
        }
        .ant-table-tbody > tr > td {
          background: ${isDarkMode ? 'transparent' : '#ffffff'} !important;
          border-bottom: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'};
        }
        .ant-pagination {
          color: ${isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)'};
        }
        .ant-select-dropdown {
          background: ${isDarkMode ? '#1f1f1f' : '#ffffff'};
        }
        .ant-input {
          background: ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#ffffff'};
          border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#d9d9d9'};
          color: ${isDarkMode ? '#fff' : '#141414'};
        }
        .ant-drawer-title {
          color: ${isDarkMode ? '#fff' : '#262626'} !important;
        }
        .ant-drawer-close {
          color: ${isDarkMode ? '#8c8c8c' : '#262626'};
        }
        .ant-steps-item-icon {
          background: ${isDarkMode ? '#1a1a1a' : '#f5f5f5'} !important;
        }
        .ant-timeline-item-content {
          color: ${isDarkMode ? '#fff' : '#262626'} !important;
        }
        .ant-tag {
          border-color: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : undefined};
        }
        ${isDarkMode ? `
          .ant-tag-success {
            background-color: rgba(22, 163, 74, 0.2);
            border-color: rgba(22, 163, 74, 0.3);
            color: #86efac;
          }
          .ant-tag-warning {
            background-color: rgba(217, 119, 6, 0.2);
            border-color: rgba(217, 119, 6, 0.3);
            color: #fde047;
          }
          .ant-tag-error {
            background-color: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.3);
            color: #fca5a5;
          }
          .ant-tag-processing {
            background-color: rgba(24, 144, 255, 0.2);
            border-color: rgba(24, 144, 255, 0.3);
            color: #93c5fd;
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default TradeOrderCenter;