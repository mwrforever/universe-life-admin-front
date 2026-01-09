import React from 'react';
import { Row, Col, Typography } from 'antd';
import StatisticCards from '../../components/Dashboard/StatisticCards';
import TrafficChart from '../../components/Dashboard/TrafficChart';
import ServicePieChart from '../../components/Dashboard/ServicePieChart';
import ServiceMonitor from '../../components/Dashboard/ServiceMonitor';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      padding: 0,
      background: isDarkMode ? 'transparent' : 'transparent',
      minHeight: 'calc(100vh - 72px - 48px)',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}>
      {/* 页面头部 */}
      <div style={{
        marginBottom: '24px',
      }}>
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              color: isDarkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.88)',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            万象生活 · 管理控制台
          </Title>
          <Text
            style={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.55)',
              fontSize: 13,
              marginTop: 6,
              display: 'block',
              letterSpacing: '0.2px',
            }}
          >
            Universe Life Admin · 实时监控平台健康状况和核心指标
          </Text>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <StatisticCards />

      {/* 主要图表区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <TrafficChart />
        </Col>
        <Col span={8}>
          <ServicePieChart />
        </Col>
      </Row>

      {/* 服务监控区域 */}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <ServiceMonitor />
        </Col>
      </Row>

      {/* 页脚信息 */}
      <div style={{
        marginTop: 48,
        textAlign: 'center',
        padding: '24px 0',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
      }}>
        <Text style={{
          color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
          fontSize: 12,
        }}>
          © 2024 Universe Life · 万象生活. 数据每30秒自动更新
        </Text>
      </div>
    </div>
  );
};

export default Dashboard;