import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Pie } from '@ant-design/plots';
import { useTheme } from '../../context/ThemeContext';

// 模拟服务分布数据
const generateServiceData = () => [
  { type: '用户服务', value: 3847, percentage: 35.2 },
  { type: '订单服务', value: 2984, percentage: 27.3 },
  { type: '支付服务', value: 1876, percentage: 17.2 },
  { type: '库存服务', value: 1243, percentage: 11.4 },
  { type: '通知服务', value: 893, percentage: 8.2 },
  { type: '其他服务', value: 157, percentage: 0.7 },
];

const ServicePieChart: React.FC = () => {
  const { theme, chartColors, isDarkMode } = useTheme();

  const pieConfig = {
    data: generateServiceData(),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    height: 400,
    color: chartColors.pieColors,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: {
        fill: chartColors.legendTextColor,
        fontSize: 12,
        fontWeight: 500,
      },
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
      {
        type: 'tooltip',
        cfg: {
          start: [{ trigger: 'mousemove' }],
          end: [{ trigger: 'mouseout' }],
        },
      },
    ],
    tooltip: {
      domStyles: {
        'g2-tooltip': {
          background: chartColors.tooltipBackground,
          color: chartColors.tooltipTextColor,
          borderRadius: '6px',
          fontSize: '12px',
          padding: '12px',
          border: `1px solid ${chartColors.gridColor}`,
        },
      },
      formatter: (data: any) => {
        return {
          name: data.type,
          value: `${new Intl.NumberFormat('zh-CN').format(data.value)} (${data.percentage}%)`,
        };
      },
    },
    legend: {
      position: 'bottom' as const,
      layout: 'horizontal',
      itemName: {
        style: {
          fill: chartColors.legendTextColor,
          fontSize: 12,
        },
        formatter: (text: string, item: any) => {
          const dataItem = item.data;
          return `${text} (${dataItem.percentage}%)`;
        },
      },
      marker: {
        symbol: 'circle',
        style: {
          r: 4,
        },
      },
    },
    statistic: {
      title: {
        style: {
          color: chartColors.axisColor,
          fontSize: 14,
        },
        content: '总请求数',
      },
      content: {
        style: {
          color: theme.token.colorText,
          fontSize: 24,
          fontWeight: 600,
        },
        content: '10,900',
      },
    },
    annotations: [
      {
        type: 'text',
        position: ['50%', '50%'],
        content: '服务分布',
        style: {
          textAlign: 'center',
          fontSize: 14,
          fill: chartColors.axisColor,
        },
      },
    ],
  };

  return (
    <ProCard
      title={
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.token.colorText,
        }}>
          服务分布统计
        </div>
      }
      subTitle="各服务模块请求占比"
      headStyle={{
        borderBottom: `1px solid ${theme.token.colorBorder}`,
        padding: '16px 24px',
      }}
      bodyStyle={{
        padding: '24px',
        background: theme.token.colorBgContainer,
      }}
      style={{
        borderRadius: theme.token.borderRadiusLG,
        boxShadow: theme.token.boxShadow,
        border: `1px solid ${theme.token.colorBorder}`,
        height: 500,
      }}
    >
      <Pie {...pieConfig} />
    </ProCard>
  );
};

export default ServicePieChart;