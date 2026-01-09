import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Area } from '@ant-design/plots';
import { useTheme } from '../../context/ThemeContext';

// 模拟流量数据
const generateTrafficData = () => [
  { time: '00:00', value: 1200, pv: 2400, uv: 800 },
  { time: '02:00', value: 800, pv: 1600, uv: 550 },
  { time: '04:00', value: 600, pv: 1200, uv: 400 },
  { time: '06:00', value: 900, pv: 1800, uv: 600 },
  { time: '08:00', value: 1500, pv: 3000, uv: 1000 },
  { time: '10:00', value: 2000, pv: 4000, uv: 1300 },
  { time: '12:00', value: 2400, pv: 4800, uv: 1600 },
  { time: '14:00', value: 2200, pv: 4400, uv: 1450 },
  { time: '16:00', value: 1900, pv: 3800, uv: 1250 },
  { time: '18:00', value: 2100, pv: 4200, uv: 1400 },
  { time: '20:00', value: 1800, pv: 3600, uv: 1200 },
  { time: '22:00', value: 1400, pv: 2800, uv: 950 },
];

const TrafficChart: React.FC = () => {
  const { theme, chartColors } = useTheme();

  // 准备多系列数据
  const transformedData = generateTrafficData().flatMap((item) => [
    { time: item.time, value: item.pv, type: 'PV (页面浏览量)' },
    { time: item.time, value: item.uv, type: 'UV (独立访客)' },
  ]);

  const areaConfig = {
    data: transformedData,
    xField: 'time',
    yField: 'value',
    height: 400,
    smooth: true,
    seriesField: 'type',
    color: [chartColors.areaChartGradient[0], chartColors.areaChartGradient[1]],
    point: {
      size: 4,
      shape: 'circle',
    },
    lineStyle: {
      width: 3,
    },
    areaStyle: {
      fillOpacity: 0.15,
    },
    xAxis: {
      type: 'cat',
      label: {
        style: {
          fill: chartColors.axisColor,
          fontSize: 12,
        },
      },
      line: {
        style: {
          stroke: chartColors.gridColor,
        },
      },
      grid: {
        line: {
          style: {
            stroke: chartColors.gridColor,
            lineWidth: 0.5,
            lineDash: [4, 4],
          },
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: chartColors.axisColor,
          fontSize: 12,
        },
        formatter: (value: number) => {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
          }
          return value.toString();
        },
      },
      line: {
        style: {
          stroke: chartColors.gridColor,
        },
      },
      grid: {
        line: {
          style: {
            stroke: chartColors.gridColor,
            lineWidth: 0.5,
            lineDash: [4, 4],
          },
        },
      },
    },
    legend: {
      position: 'top' as const,
      itemName: {
        style: {
          fill: chartColors.legendTextColor,
          fontSize: 14,
        },
      },
    },
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
          value: new Intl.NumberFormat('zh-CN').format(data.value),
        };
      },
    },
    annotations: [],
    interactions: [
      {
        type: 'tooltip',
        cfg: {
          start: [{ trigger: 'mousemove' }],
          end: [{ trigger: 'mouseout' }],
        },
      },
      {
        type: 'legend-highlight',
        cfg: {
          start: [{ trigger: 'legend-item:mouseenter', action: 'element-highlight:highlight' }],
          end: [{ trigger: 'legend-item:mouseleave', action: 'element-highlight:reset' }],
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
          流量趋势分析
        </div>
      }
      subTitle="实时监控平台访问情况"
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
      }}
    >
      <Area {...areaConfig} />
    </ProCard>
  );
};

export default TrafficChart;