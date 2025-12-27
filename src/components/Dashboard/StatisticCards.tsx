import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Statistic, Row, Col, Grid } from 'antd';
import { UserOutlined, DollarOutlined, ThunderboltOutlined, FileTextOutlined } from '@ant-design/icons';
import { Area, Column } from '@ant-design/plots';
import { useTheme } from '../../context/ThemeContext';
import styled from '@emotion/styled';

// 模拟趋势数据
const generateTrendData = () => [
  { date: '2024-12-01', value: 1200 },
  { date: '2024-12-02', value: 1300 },
  { date: '2024-12-03', value: 1150 },
  { date: '2024-12-04', value: 1400 },
  { date: '2024-12-05', value: 1600 },
  { date: '2024-12-06', value: 1550 },
  { date: '2024-12-07', value: 1800 },
];

const generateQpsData = () => [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 23 },
  { time: '08:00', value: 89 },
  { time: '12:00', value: 134 },
  { time: '16:00', value: 98 },
  { time: '20:00', value: 67 },
];

// ============== 样式组件 ==============

// 主要统计卡片 - 重要指标
const PrimaryStatCard = styled(ProCard, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean; theme?: any }>`
  border-radius: ${props => props.theme?.token?.borderRadiusLG || 8}px;
  box-shadow: ${props => props.isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(31, 38, 135, 0.15)'};
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.isDark
    ? 'linear-gradient(135deg, rgba(91, 80, 255, 0.08) 0%, rgba(20, 25, 45, 0.95) 100%)'
    : 'linear-gradient(135deg, rgba(91, 80, 255, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #5B50FF, #7C7AFF, #9CA7FF);
    border-radius: ${props => props.theme?.token?.borderRadiusLG || 8}px ${props => props.theme?.token?.borderRadiusLG || 8}px 0 0;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.isDark
      ? '0 20px 60px rgba(91, 80, 255, 0.25)'
      : '0 20px 60px rgba(91, 80, 255, 0.18)'};
    border-color: #5B50FF;

    &::before {
      height: 6px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    }
  }

  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

// 次要统计卡片
const SecondaryStatCard = styled(ProCard, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean; theme?: any }>`
  border-radius: ${props => props.theme?.token?.borderRadiusLG || 8}px;
  box-shadow: ${props => props.isDark
    ? '0 4px 16px rgba(0, 0, 0, 0.2)'
    : '0 4px 16px rgba(31, 38, 135, 0.1)'};
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 1px solid ${props => props.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'};
  background: ${props => props.isDark
    ? 'rgba(20, 25, 45, 0.95)'
    : 'rgba(255, 255, 255, 0.98)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.isDark
      ? '0 12px 32px rgba(0, 0, 0, 0.3)'
      : '0 12px 32px rgba(31, 38, 135, 0.15)'};
    border-color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(91, 80, 255, 0.15)'};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const StatisticCards: React.FC = () => {
  const { theme, chartColors, isDarkMode } = useTheme();
  const screens = Grid.useBreakpoint();

  // 迷你面积图配置
  const areaConfig = {
    data: generateTrendData(),
    xField: 'date',
    yField: 'value',
    height: 60,
    smooth: true,
    color: chartColors.lineColor,
    point: {
      size: 0,
    },
    lineStyle: {
      width: 2,
    },
    areaStyle: {
      fill: `l(270) 0:${chartColors.areaChartGradient[0]} 1:${chartColors.areaChartGradient[2]}`,
      fillOpacity: 0.3,
    },
    xAxis: {
      type: 'cat',
      show: false,
    },
    yAxis: {
      show: false,
    },
    tooltip: {
      show: false,
    },
    annotations: [],
  };

  // 迷你柱状图配置
  const columnConfig = {
    data: generateQpsData(),
    xField: 'time',
    yField: 'value',
    height: 60,
    color: chartColors.lineColor,
    columnWidthRatio: 0.6,
    columnStyle: {
      radius: [2, 2, 0, 0],
    },
    xAxis: {
      type: 'cat',
      show: false,
    },
    yAxis: {
      show: false,
    },
    tooltip: {
      show: false,
    },
  };

  return (
    <div style={{ marginBottom: 32 }}>
      {/* 主要指标行 - 总用户数和今日GMV */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <PrimaryStatCard
            theme={theme}
            isDark={isDarkMode}
            bodyStyle={{
              padding: screens.xs ? '20px' : '32px',
              background: 'transparent',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: screens.xs ? 16 : 24,
            }}>
              <div style={{
                color: chartColors.legendTextColor,
                fontSize: screens.xs ? 14 : 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontWeight: 500,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'transparent',
                  border: '2px solid #5B50FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <UserOutlined style={{
                    color: '#5B50FF',
                    fontSize: 22,
                  }} />
                </div>
                <span>总用户数</span>
              </div>
            </div>

            <Statistic
              value={125678}
              precision={0}
              valueStyle={{
                color: theme.token.colorText,
                fontSize: screens.xs ? 32 : 40,
                fontWeight: 700,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            />

            <div style={{
              height: screens.xs ? 50 : 60,
              marginTop: -8,
              marginBottom: 16,
            }}>
              <Area {...areaConfig} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: 13,
                color: chartColors.axisColor,
              }}>
                <span style={{
                  color: theme.token.colorSuccess,
                  fontWeight: 600,
                  fontSize: 14,
                }}>↑ 12.5%</span>
                <span style={{ marginLeft: 8 }}>较上周</span>
              </div>
              <div style={{
                fontSize: 12,
                color: chartColors.axisColor,
                opacity: 0.7,
              }}>
                实时更新
              </div>
            </div>
          </PrimaryStatCard>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <PrimaryStatCard
            theme={theme}
            isDark={isDarkMode}
            bodyStyle={{
              padding: screens.xs ? '20px' : '32px',
              background: 'transparent',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: screens.xs ? 16 : 24,
            }}>
              <div style={{
                color: chartColors.legendTextColor,
                fontSize: screens.xs ? 14 : 16,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontWeight: 500,
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'transparent',
                  border: '2px solid #52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <DollarOutlined style={{
                    color: '#52c41a',
                    fontSize: 22,
                  }} />
                </div>
                <span>今日GMV</span>
              </div>
            </div>

            <Statistic
              value={893426}
              precision={2}
              prefix="¥"
              valueStyle={{
                color: theme.token.colorText,
                fontSize: screens.xs ? 32 : 40,
                fontWeight: 700,
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            />

            <div style={{
              height: screens.xs ? 50 : 60,
              marginTop: -8,
              marginBottom: 16,
            }}>
              <Area {...areaConfig} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: 13,
                color: chartColors.axisColor,
              }}>
                <span style={{
                  color: theme.token.colorSuccess,
                  fontWeight: 600,
                  fontSize: 14,
                }}>↑ 8.3%</span>
                <span style={{ marginLeft: 8 }}>较昨日</span>
              </div>
              <div style={{
                fontSize: 12,
                color: chartColors.axisColor,
                opacity: 0.7,
              }}>
                今日统计
              </div>
            </div>
          </PrimaryStatCard>
        </Col>
      </Row>

      {/* 次要指标行 - QPS和待处理工单 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <SecondaryStatCard
            theme={theme}
            isDark={isDarkMode}
            bodyStyle={{
              padding: screens.xs ? '20px' : '24px',
              background: 'transparent',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: screens.xs ? 12 : 16,
            }}>
              <div style={{
                color: chartColors.legendTextColor,
                fontSize: screens.xs ? 13 : 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 500,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'transparent',
                  border: '2px solid #faad14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <ThunderboltOutlined style={{
                    color: '#faad14',
                    fontSize: 18,
                  }} />
                </div>
                <span>QPS</span>
              </div>
            </div>

            <Statistic
              value={1847}
              precision={0}
              valueStyle={{
                color: theme.token.colorText,
                fontSize: screens.xs ? 24 : 28,
                fontWeight: 600,
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            />

            <div style={{
              height: screens.xs ? 45 : 50,
              marginTop: -8,
              marginBottom: 12,
            }}>
              <Column {...columnConfig} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: 12,
                color: chartColors.axisColor,
              }}>
                <span style={{
                  color: theme.token.colorError,
                  fontWeight: 600,
                  fontSize: 13,
                }}>↓ 3.2%</span>
                <span style={{ marginLeft: 6 }}>较昨日</span>
              </div>
              <div style={{
                fontSize: 11,
                color: chartColors.axisColor,
                opacity: 0.7,
              }}>
                每秒查询数
              </div>
            </div>
          </SecondaryStatCard>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <SecondaryStatCard
            theme={theme}
            isDark={isDarkMode}
            bodyStyle={{
              padding: screens.xs ? '20px' : '24px',
              background: 'transparent',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: screens.xs ? 12 : 16,
            }}>
              <div style={{
                color: chartColors.legendTextColor,
                fontSize: screens.xs ? 13 : 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontWeight: 500,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'transparent',
                  border: '2px solid #1677ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FileTextOutlined style={{
                    color: '#1677ff',
                    fontSize: 18,
                  }} />
                </div>
                <span>待处理工单</span>
              </div>
            </div>

            <Statistic
              value={234}
              precision={0}
              valueStyle={{
                color: theme.token.colorText,
                fontSize: screens.xs ? 24 : 28,
                fontWeight: 600,
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            />

            <div style={{
              height: screens.xs ? 45 : 50,
              marginTop: -8,
              marginBottom: 12,
            }}>
              <Area {...areaConfig} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                fontSize: 12,
                color: chartColors.axisColor,
              }}>
                <span style={{
                  color: theme.token.colorWarning,
                  fontWeight: 600,
                  fontSize: 13,
                }}>→ 0%</span>
                <span style={{ marginLeft: 6 }}>较昨日持平</span>
              </div>
              <div style={{
                fontSize: 11,
                color: chartColors.axisColor,
                opacity: 0.7,
              }}>
                需要处理
              </div>
            </div>
          </SecondaryStatCard>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticCards;