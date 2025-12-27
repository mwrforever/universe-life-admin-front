import React, { useState, useEffect } from 'react';
import { ProCard, ProList } from '@ant-design/pro-components';
import { Badge, Tag, Progress, Space, Tooltip, Typography } from 'antd';
import {
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const { Text } = Typography;

// 服务状态接口
interface ServiceStatus {
  id: string;
  name: string;
  type: 'nacos' | 'redis' | 'mysql' | 'api-gateway' | 'message-queue';
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  lastCheck: string;
  description: string;
  url?: string;
}

// 模拟服务数据
const initialServices: ServiceStatus[] = [
  {
    id: 'nacos-01',
    name: 'Nacos 服务注册中心',
    type: 'nacos',
    status: 'healthy',
    uptime: 99.98,
    responseTime: 12,
    cpuUsage: 35,
    memoryUsage: 68,
    lastCheck: new Date().toISOString(),
    description: '服务发现与配置管理',
    url: 'http://nacos.universe-life.com:8848',
  },
  {
    id: 'redis-01',
    name: 'Redis 缓存集群',
    type: 'redis',
    status: 'healthy',
    uptime: 99.99,
    responseTime: 3,
    cpuUsage: 28,
    memoryUsage: 45,
    lastCheck: new Date().toISOString(),
    description: '分布式缓存服务',
    url: 'redis://redis.universe-life.com:6379',
  },
  {
    id: 'mysql-01',
    name: 'MySQL 主数据库',
    type: 'mysql',
    status: 'warning',
    uptime: 99.85,
    responseTime: 45,
    cpuUsage: 72,
    memoryUsage: 89,
    lastCheck: new Date().toISOString(),
    description: '主业务数据库',
    url: 'mysql://mysql.universe-life.com:3306',
  },
  {
    id: 'gateway-01',
    name: 'API 网关',
    type: 'api-gateway',
    status: 'healthy',
    uptime: 99.92,
    responseTime: 8,
    cpuUsage: 41,
    memoryUsage: 52,
    lastCheck: new Date().toISOString(),
    description: '统一流量入口',
  },
  {
    id: 'mq-01',
    name: 'RocketMQ 消息队列',
    type: 'message-queue',
    status: 'healthy',
    uptime: 99.96,
    responseTime: 6,
    cpuUsage: 33,
    memoryUsage: 61,
    lastCheck: new Date().toISOString(),
    description: '异步消息处理',
    url: 'http://mq.universe-life.com:8161',
  },
];

const ServiceMonitor: React.FC = () => {
  const { theme, chartColors, isDarkMode } = useTheme();
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [isChecking, setIsChecking] = useState(false);

  // 获取服务类型图标
  const getServiceIcon = (type: string) => {
    const iconMap = {
      nacos: <DatabaseOutlined style={{ color: theme.token.colorPrimary }} />,
      redis: <CloudServerOutlined style={{ color: theme.token.colorSuccess }} />,
      mysql: <DatabaseOutlined style={{ color: theme.token.colorWarning }} />,
      'api-gateway': <ApiOutlined style={{ color: theme.token.colorInfo }} />,
      'message-queue': <ApiOutlined style={{ color: theme.token.colorError }} />,
    };
    return iconMap[type as keyof typeof iconMap] || <ApiOutlined />;
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const statusMap = {
      healthy: {
        status: 'success' as const,
        text: '正常',
        icon: <CheckCircleOutlined />,
      },
      warning: {
        status: 'warning' as const,
        text: '警告',
        icon: <ExclamationCircleOutlined />,
      },
      error: {
        status: 'error' as const,
        text: '错误',
        icon: <CloseCircleOutlined />,
      },
    };
    const config = statusMap[status as keyof typeof statusMap];
    return (
      <Badge
        status={config.status}
        text={
          <Space size={4}>
            {config.icon}
            <span style={{ color: theme.token.colorText }}>{config.text}</span>
          </Space>
        }
      />
    );
  };

  // 获取进度条颜色
  const getProgressColor = (usage: number) => {
    if (usage >= 80) return theme.token.colorError;
    if (usage >= 60) return theme.token.colorWarning;
    return theme.token.colorSuccess;
  };

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: service.responseTime + Math.floor(Math.random() * 10) - 5,
        cpuUsage: Math.max(10, Math.min(95, service.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(20, Math.min(95, service.memoryUsage + Math.floor(Math.random() * 8) - 4)),
        lastCheck: new Date().toISOString(),
      })));
    }, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  // 手动检查服务状态
  const checkServices = async () => {
    setIsChecking(true);
    // 模拟检查过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsChecking(false);
  };

  const breatheAnimation = {
    animation: 'breathe 2s ease-in-out infinite',
    '@keyframes breathe': {
      '0%': { opacity: 1, transform: 'scale(1)' },
      '50%': { opacity: 0.7, transform: 'scale(1.1)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  };

  return (
    <ProCard
      title={
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.token.colorText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}>
          <span>服务监控状态</span>
          <Tooltip title="刷新服务状态">
            <ReloadOutlined
              style={{
                cursor: 'pointer',
                color: theme.token.colorPrimary,
                fontSize: 14,
                ...(isChecking && { animation: 'spin 1s linear infinite' }),
              }}
              onClick={checkServices}
            />
          </Tooltip>
        </div>
      }
      subTitle={
        <div style={{
          color: chartColors.legendTextColor,
          fontSize: 12,
        }}>
          实时监控核心服务状态
        </div>
      }
      headStyle={{
        borderBottom: `1px solid ${theme.token.colorBorder}`,
        padding: '16px 24px',
      }}
      bodyStyle={{
        padding: 0,
        background: theme.token.colorBgContainer,
      }}
      style={{
        borderRadius: theme.token.borderRadiusLG,
        boxShadow: theme.token.boxShadow,
        border: `1px solid ${theme.token.colorBorder}`,
      }}
    >
      <ProList<ServiceStatus>
        dataSource={services}
        rowKey="id"
        showActions="hover"
        showExtra="hover"
        metas={{
          title: {
            dataIndex: 'name',
            render: (_, record) => (
              <Space>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: record.status === 'healthy' ? theme.token.colorSuccess :
                                     record.status === 'warning' ? theme.token.colorWarning :
                                     theme.token.colorError,
                    ...breatheAnimation,
                  }}
                />
                {getServiceIcon(record.type)}
                <Text style={{ color: theme.token.colorText, fontWeight: 500 }}>
                  {record.name}
                </Text>
              </Space>
            ),
          },
          description: {
            dataIndex: 'description',
            render: (text) => (
              <Text style={{ color: chartColors.axisColor, fontSize: 12 }}>
                {text}
              </Text>
            ),
          },
          subTitle: {
            render: (_, record) => (
              <Space size={16}>
                <Text style={{ color: chartColors.axisColor, fontSize: 12 }}>
                  响应时间: {record.responseTime}ms
                </Text>
                <Text style={{ color: chartColors.axisColor, fontSize: 12 }}>
                  运行时间: {record.uptime}%
                </Text>
              </Space>
            ),
          },
          content: {
            render: (_, record) => (
              <div style={{ width: '100%' }}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: chartColors.axisColor, fontSize: 12, minWidth: 60 }}>
                      CPU使用率:
                    </Text>
                    <Progress
                      percent={record.cpuUsage}
                      size="small"
                      strokeColor={getProgressColor(record.cpuUsage)}
                      style={{ flex: 1, margin: 0 }}
                      showInfo={false}
                    />
                    <Text style={{ color: theme.token.colorText, fontSize: 12, minWidth: 35 }}>
                      {record.cpuUsage}%
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text style={{ color: chartColors.axisColor, fontSize: 12, minWidth: 60 }}>
                      内存使用率:
                    </Text>
                    <Progress
                      percent={record.memoryUsage}
                      size="small"
                      strokeColor={getProgressColor(record.memoryUsage)}
                      style={{ flex: 1, margin: 0 }}
                      showInfo={false}
                    />
                    <Text style={{ color: theme.token.colorText, fontSize: 12, minWidth: 35 }}>
                      {record.memoryUsage}%
                    </Text>
                  </div>
                </Space>
              </div>
            ),
          },
          actions: {
            render: (_, record) => [
              <div key={`status-${record.id}`}>{getStatusBadge(record.status)}</div>,
            ],
          },
        }}
      />
    </ProCard>
  );
};

export default ServiceMonitor;