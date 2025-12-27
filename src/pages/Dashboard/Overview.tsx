/**
 * Universe Life Admin - 仪表盘概览页面
 *
 * 高端企业级数据展示页面，集成到 ProLayout 中
 *
 * @author James
 * @version 1.0.0
 */

import React from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Space } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RocketOutlined,
  CloudOutlined,
  SafetyOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';

const DashboardOverview: React.FC = () => {
  // 模拟数据
  const statistics = [
    {
      title: '总用户数',
      value: 125678,
      prefix: <UserOutlined />,
      suffix: '人',
      valueStyle: { color: '#3f8600' },
      trend: 12.5,
      icon: <UserOutlined style={{ color: '#3f8600' }} />,
    },
    {
      title: '今日交易',
      value: 3289,
      prefix: <ShoppingCartOutlined />,
      suffix: '笔',
      valueStyle: { color: '#1890ff' },
      trend: 8.2,
      icon: <ShoppingCartOutlined style={{ color: '#1890ff' }} />,
    },
    {
      title: '总营收',
      value: 896734,
      prefix: <DollarOutlined />,
      suffix: '元',
      valueStyle: { color: '#722ed1' },
      trend: 15.3,
      icon: <DollarOutlined style={{ color: '#722ed1' }} />,
    },
    {
      title: '消息总量',
      value: 567890,
      prefix: <MessageOutlined />,
      suffix: '条',
      valueStyle: { color: '#eb2f96' },
      trend: -2.1,
      icon: <MessageOutlined style={{ color: '#eb2f96' }} />,
    },
  ];

  const recentActivities = [
    {
      title: '新用户注册',
      description: '用户 "张三" 完成注册',
      time: '2分钟前',
      avatar: <Avatar icon={<UserOutlined />} />,
      type: 'success' as const,
    },
    {
      title: '系统维护完成',
      description: '数据库维护任务已成功完成',
      time: '15分钟前',
      avatar: <Avatar icon={<CloudOutlined />} />,
      type: 'info' as const,
    },
    {
      title: '安全告警',
      description: '检测到异常登录行为，已自动阻止',
      time: '1小时前',
      avatar: <Avatar icon={<SafetyOutlined />} />,
      type: 'warning' as const,
    },
    {
      title: '服务部署',
      description: '聊天服务新版本已成功部署',
      time: '3小时前',
      avatar: <Avatar icon={<RocketOutlined />} />,
      type: 'default' as const,
    },
  ];

  const systemHealth = [
    { name: 'API 服务', status: '健康', percent: 99.8, color: '#52c41a' },
    { name: '数据库', status: '良好', percent: 95.2, color: '#1890ff' },
    { name: '消息队列', status: '正常', percent: 87.6, color: '#722ed1' },
    { name: '文件存储', status: '优秀', percent: 92.3, color: '#13c2c2' },
    { name: '缓存服务', status: '良好', percent: 94.7, color: '#fa8c16' },
  ];

  return (
    <div style={{ padding: 0 }}>
      {/* 数据统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {stat.icon}
                    {stat.title}
                  </div>
                }
                value={stat.value}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle}
                prefix={stat.prefix}
              />
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                {stat.trend > 0 ? (
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                )}
                <span style={{ color: stat.trend > 0 ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                  {Math.abs(stat.trend)}%
                </span>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>较昨日</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 系统健康状况 */}
        <Col xs={24} lg={12}>
          <ProCard
            title="系统健康状况"
            extra={<Tag color="green">实时监控</Tag>}
            headerBordered
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {systemHealth.map((item, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <Space>
                      <Tag color={item.color}>{item.status}</Tag>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.percent}%</span>
                    </Space>
                  </div>
                  <Progress
                    percent={item.percent}
                    strokeColor={item.color}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </Space>
          </ProCard>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={12}>
          <ProCard
            title="最近活动"
            extra={<Tag color="blue">实时更新</Tag>}
            headerBordered
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.avatar}
                    title={
                      <Space>
                        {item.title}
                        <Tag color={item.type === 'success' ? 'green' :
                                   item.type === 'warning' ? 'orange' :
                                   item.type === 'info' ? 'blue' : 'default'}>
                          {item.type === 'success' ? '成功' :
                           item.type === 'warning' ? '警告' :
                           item.type === 'info' ? '信息' : '一般'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{item.description}</div>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.time}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 底部扩展信息 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <ProCard
            title="快速操作"
            tabs={{
              items: [
                {
                  key: 'users',
                  label: '用户管理',
                  children: (
                    <Row gutter={[16, 16]}>
                      <Col span={6}>
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 8 }}>
                          <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                          <div>新增用户</div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 8 }}>
                          <TeamOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                          <div>用户分组</div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 8 }}>
                          <SafetyOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
                          <div>权限设置</div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card hoverable style={{ textAlign: 'center', borderRadius: 8 }}>
                          <MessageOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
                          <div>消息通知</div>
                        </Card>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: 'system',
                  label: '系统设置',
                  children: (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <RocketOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                      <div style={{ fontSize: 16, color: '#8c8c8c' }}>
                        系统配置功能正在开发中...
                      </div>
                    </div>
                  ),
                },
              ],
            }}
            style={{
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;