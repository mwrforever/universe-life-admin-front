/**
 * Universe Life Admin - 宇宙科技美学导航栏
 *
 * 采用深空蓝紫色调 + 玻璃拟态效果的未来感设计
 * 集成粒子背景、霓虹光效和流畅动画
 *
 * @author James
 * @version 3.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Button,
  Typography,
  Space,
  Tooltip
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SettingOutlined,
  NotificationOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  MoneyCollectOutlined,
  BarChartOutlined,
  MonitorOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useTheme } from '../../context/ThemeContext';
import styled from '@emotion/styled';
import UniverseLifeLogo from '../common/UniverseLifeLogo';

const { Header, Sider } = Layout;

// ============== 样式组件 ==============

// 玻璃拟态头部
const GlassHeader = styled(Header, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 72px;
  padding: 0 32px;
  background: ${props => props.isDark
    ? 'rgba(17, 25, 40, 0.75)'
    : 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${props => props.isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(31, 38, 135, 0.15)'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

// 宇宙品牌Logo - 使用真实logo图片并修复阴影问题
const CosmicLogo = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-height: 56px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.03)'
      : 'rgba(102, 126, 234, 0.05)'};
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    z-index: 2;
  }

  .logo-text {
    position: relative;
    z-index: 2;
    transition: transform 0.3s ease;
    line-height: 1.2;
    max-height: 44px;
    overflow: hidden;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.2px;
      transition: all 0.3s ease;
      line-height: 1.2;
      white-space: nowrap;
    }

    p {
      margin: 0;
      font-size: 10px;
      color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
      font-weight: 500;
      transition: all 0.3s ease;
      line-height: 1.1;
      white-space: nowrap;
      margin-top: 1px;
    }
  }

  &:hover {
    &::before {
      opacity: 1;
    }

    .logo-icon {
      transform: translateY(-1px) scale(1.08);
    }

    .logo-text {
      transform: translateX(1px);

      h3 {
        filter: brightness(1.15);
      }

      p {
        color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
      }
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

// 深空搜索框 - 重新设计交互效果
const CosmicSearch = styled(Input.Search, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  max-width: 480px;
  position: relative;

  .ant-input-wrapper {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 24px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }
  }

  .ant-input {
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(255, 255, 255, 0.95)'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)'};
    border-radius: 24px;
    height: 44px;
    font-size: 14px;
    padding: 0 20px;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: ${props => props.isDark
      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.05)'};

    &::placeholder {
      color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
      transition: color 0.3s ease;
    }

    &:hover {
      background: ${props => props.isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 1)'};
      border-color: ${props => props.isDark
        ? 'rgba(102, 126, 234, 0.3)'
        : 'rgba(102, 126, 234, 0.2)'};
      transform: translateY(-1px);
      box-shadow: ${props => props.isDark
        ? '0 4px 16px rgba(0, 0, 0, 0.3)'
        : '0 4px 16px rgba(102, 126, 234, 0.15)'};

      &::placeholder {
        color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)'};
      }
    }

    &:focus {
      background: ${props => props.isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 1)'};
      border-color: transparent;
      transform: translateY(-2px);
      box-shadow: ${props => props.isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(102, 126, 234, 0.25)'};

      & + .ant-input-search-button {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-color: transparent;
      }
    }
  }

  .ant-input-search-button {
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(102, 126, 234, 0.1)'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.08)'};
    border-left: none;
    border-radius: 0 24px 24px 0;
    height: 44px;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    &:hover {
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-color: transparent;
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);

      .anticon {
        color: white;
      }
    }

    &:active {
      transform: scale(0.95);
    }

    .anticon {
      color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(102, 126, 234, 0.7)'};
      transition: color 0.3s ease;
    }
  }

  &:hover .ant-input-wrapper::before {
    opacity: 0.1;
  }

  .ant-input:focus + .ant-input-search-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;

    .anticon {
      color: white;
    }
  }
`;

// 霓虹按钮 - 重新设计悬浮效果
const NeonButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  background: ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  border-radius: 16px;
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: ${props => props.isDark
    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: translate(-50%, -50%);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 1;
  }

  .anticon {
    position: relative;
    z-index: 2;
    color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
    font-size: 16px;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    border-color: transparent;
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);

    &::before {
      width: 100px;
      height: 100px;
    }

    .anticon {
      color: white;
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

// 用户头像卡片 - 重新设计悬浮效果
const UserCard = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 26px;
  background: ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: ${props => props.isDark
    ? '0 2px 8px rgba(0, 0, 0, 0.2)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 1)'};
    border-color: ${props => props.isDark
      ? 'rgba(102, 126, 234, 0.3)'
      : 'rgba(102, 126, 234, 0.2)'};
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${props => props.isDark
      ? '0 12px 32px rgba(0, 0, 0, 0.4)'
      : '0 12px 32px rgba(102, 126, 234, 0.25)'};

    &::before {
      left: 100%;
    }

    .ant-avatar {
      transform: scale(1.1);
    }

    .user-info {
      .user-name {
        color: ${props => props.isDark ? '#ffffff' : '#1a1a1a'};
        transform: translateX(2px);
      }

      .user-email {
        color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
        transform: translateX(2px);
      }
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  .ant-avatar {
    position: relative;
    z-index: 2;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: transparent !important;
  }

  .user-info {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'};
      line-height: 1.2;
      transition: all 0.3s ease;
    }

    .user-email {
      font-size: 11px;
      color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.45)'};
      line-height: 1.2;
      transition: all 0.3s ease;
    }
  }
`;

// 星空侧边栏
const CosmicSider = styled(Sider, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  position: fixed !important;
  top: 72px !important;
  left: 0 !important;
  bottom: 0 !important;
  z-index: 999;
  background: ${props => props.isDark
    ? 'rgba(17, 25, 40, 0.95)'
    : 'rgba(255, 255, 255, 0.95)'} !important;
  backdrop-filter: blur(20px);
  border-right: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};

  .ant-layout-sider-children {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

// 宇宙菜单 - 重新设计交互效果
const CosmicMenu = styled(Menu, {
  shouldForwardProp: (prop) => prop !== 'isDark',
})<{ isDark: boolean }>`
  background: transparent !important;
  border: none !important;
  padding: 16px 12px;

  .ant-menu-item {
    margin: 6px 8px;
    border-radius: 16px;
    height: 48px;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(255, 255, 255, 0.5)'};

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 3px;
      height: 0;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: translateY(-50%);
      transition: height 0.3s ease;
      border-radius: 0 2px 2px 0;
    }

    &:hover {
      background: ${props => props.isDark
        ? 'rgba(102, 126, 234, 0.12)'
        : 'rgba(102, 126, 234, 0.08)'} !important;
      transform: translateX(4px);

      &::before {
        height: 60%;
      }

      .anticon {
        color: ${props => props.isDark
          ? 'rgba(255, 255, 255, 0.95)'
          : '#667eea'} !important;
        transform: scale(1.1);
      }

      .ant-menu-title-content {
        color: ${props => props.isDark
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(0, 0, 0, 0.9)'} !important;
        font-weight: 600;
        transform: translateX(2px);
      }
    }

    &.ant-menu-item-selected {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15)) !important;
      transform: translateX(6px);
      box-shadow: ${props => props.isDark
        ? '0 4px 16px rgba(102, 126, 234, 0.2)'
        : '0 4px 16px rgba(102, 126, 234, 0.15)'};

      &::before {
        height: 70%;
        width: 4px;
      }

      &::after {
        display: none;
      }

      .anticon {
        color: #667eea !important;
        transform: scale(1.15);
        filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.5));
      }

      .ant-menu-title-content {
        color: ${props => props.isDark
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(0, 0, 0, 0.95)'} !important;
        font-weight: 700;
        transform: translateX(4px);
      }
    }

    &:active {
      transform: translateX(2px) scale(0.98);
    }

    .anticon {
      font-size: 18px;
      color: ${props => props.isDark
        ? 'rgba(255, 255, 255, 0.75)'
        : 'rgba(0, 0, 0, 0.6)'};
      transition: all 0.3s ease;
      margin-right: 12px;
    }

    .ant-menu-title-content {
      color: ${props => props.isDark
        ? 'rgba(255, 255, 255, 0.85)'
        : 'rgba(0, 0, 0, 0.75)'} !important;
      font-weight: 500;
      transition: all 0.3s ease;
    }
  }
`;

// 主内容区域 - 修复深色模式显示问题
const CosmicContent = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDark' && prop !== 'siderWidth',
})<{ isDark: boolean; siderWidth: number }>`
  margin-left: ${props => props.siderWidth}px;
  margin-top: 72px;
  min-height: calc(100vh - 72px);
  width: calc(100% - ${props => props.siderWidth}px);
  max-width: calc(100% - ${props => props.siderWidth}px);
  background: ${props => props.isDark
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
    : 'linear-gradient(135deg, #f5f7fa 0%, #ffffff 50%, #e8ecf1 100%)'};
  transition: all 0.3s ease;
  padding: 24px;
  border-radius: 20px 0 0 0;
  box-sizing: border-box;
  overflow-x: hidden;

  /* Ant Design 组件深度适配 */
  .ant-card {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
    border: ${props => props.isDark
      ? '1px solid rgba(255, 255, 255, 0.1) !important'
      : '1px solid rgba(0, 0, 0, 0.1) !important'};
    box-shadow: ${props => props.isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.3) !important'
      : '0 8px 32px rgba(31, 38, 135, 0.15) !important'};
  }

  .ant-card-head {
    background: ${props => props.isDark
      ? 'rgba(30, 35, 55, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
    border-bottom: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1) !important'
      : 'rgba(0, 0, 0, 0.1) !important'};
  }

  .ant-card-head-title {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-card-body {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
  }

  .ant-table-wrapper {
    background: transparent !important;
    border-radius: 0;
    padding: 0;
  }

  .ant-table {
    background: ${props => props.isDark ? '#141414 !important' : '#ffffff !important'};
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-table-thead > tr > th {
    background: ${props => props.isDark ? '#1a1a2e !important' : '#fafafa !important'};
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
    border-bottom: 1px solid ${props => props.isDark ? '#303030 !important' : '#f0f0f0 !important'};
  }

  .ant-table-tbody > tr > td {
    background: ${props => props.isDark ? '#141414 !important' : '#ffffff !important'};
    color: ${props => props.isDark ? '#e0e0e0 !important' : '#000000 !important'};
    border-bottom: 1px solid ${props => props.isDark ? '#303030 !important' : '#f0f0f0 !important'};
  }

  .ant-table-tbody > tr:hover > td {
    background: ${props => props.isDark ? '#262647 !important' : '#f5f5f5 !important'};
  }

  .ant-btn {
    background: ${props => props.isDark
      ? 'rgba(30, 35, 55, 0.8) !important'
      : 'rgba(255, 255, 255, 0.8) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.2) !important'
      : 'rgba(0, 0, 0, 0.2) !important'};
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-btn:hover {
    background: ${props => props.isDark
      ? 'rgba(50, 55, 75, 0.8) !important'
      : 'rgba(230, 230, 230, 0.8) !important'};
  }

  .ant-input {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.8) !important'
      : 'rgba(255, 255, 255, 0.8) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.2) !important'
      : 'rgba(0, 0, 0, 0.2) !important'};
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-input::placeholder {
    color: ${props => props.isDark ? '#888888 !important' : '#999999 !important'};
  }

  .ant-select-selector {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.8) !important'
      : 'rgba(255, 255, 255, 0.8) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.2) !important'
      : 'rgba(0, 0, 0, 0.2) !important'};
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  /* 统计卡片特殊样式 */
  .ant-statistic {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-statistic-title {
    color: ${props => props.isDark ? '#b0b0b0 !important' : '#666666 !important'};
  }

  .ant-statistic-content {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  /* 列表项 */
  .ant-list-item {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.8) !important'
      : 'rgba(255, 255, 255, 0.8) !important'};
    border-bottom: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1) !important'
      : 'rgba(0, 0, 0, 0.1) !important'};
  }

  .ant-list-item-meta-title {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-list-item-meta-description {
    color: ${props => props.isDark ? '#b0b0b0 !important' : '#666666 !important'};
  }

  /* 标签 */
  .ant-tag {
    background: ${props => props.isDark
      ? 'rgba(50, 55, 75, 0.6) !important'
      : 'rgba(240, 240, 240, 0.8) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1) !important'
      : 'rgba(0, 0, 0, 0.1) !important'};
    color: ${props => props.isDark ? '#e0e0e0 !important' : '#000000 !important'};
  }

  /* 分页器 */
  .ant-pagination-item {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.8) !important'
      : 'rgba(255, 255, 255, 0.8) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.2) !important'
      : 'rgba(0, 0, 0, 0.2) !important'};
  }

  .ant-pagination-item a {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-pagination-item-active {
    background: ${props => props.isDark
      ? 'rgba(64, 87, 134, 0.8) !important'
      : 'rgba(24, 144, 255, 0.1) !important'};
    border-color: ${props => props.isDark
      ? '#405786 !important'
      : '#1890ff !important'};
  }

  .ant-pagination-item-active a {
    color: ${props => props.isDark ? '#ffffff !important' : '#1890ff !important'};
  }

  /* 强制所有文本颜色适配 */
  h1, h2, h3, h4, h5, h6, .ant-typography h1, .ant-typography h2, .ant-typography h3, .ant-typography h4, .ant-typography h5, .ant-typography h6 {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  p, span, div, label, text, .ant-typography {
    color: ${props => props.isDark ? '#e0e0e0 !important' : '#000000 !important'};
  }

  /* 图表容器 */
  .ant-card-chart {
    background: ${props => props.isDark
      ? 'rgba(15, 20, 35, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
  }

  /* 模态框 */
  .ant-modal-content {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.98) !important'
      : 'rgba(255, 255, 255, 0.98) !important'};
    border: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1) !important'
      : 'rgba(0, 0, 0, 0.1) !important'};
  }

  .ant-modal-header {
    background: ${props => props.isDark
      ? 'rgba(30, 35, 55, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
    border-bottom: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.1) !important'
      : 'rgba(0, 0, 0, 0.1) !important'};
  }

  .ant-modal-title {
    color: ${props => props.isDark ? '#ffffff !important' : '#000000 !important'};
  }

  .ant-modal-body {
    background: ${props => props.isDark
      ? 'rgba(20, 25, 45, 0.95) !important'
      : 'rgba(255, 255, 255, 0.95) !important'};
  }
`;

// ============== 组件定义 ==============

// 主题切换提示组件
const ThemeTooltip: React.FC<{
  isDark: boolean;
  text: string;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  children: React.ReactNode;
}> = ({ isDark, text, visible, onVisibleChange, children }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(8px)',
            marginTop: '8px',
            padding: '6px 12px',
            background: isDark
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(0, 0, 0, 0.85)',
            color: isDark
              ? 'rgba(0, 0, 0, 0.88)'
              : '#ffffff',
            fontSize: '12px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'tooltipFadeIn 0.3s ease-out',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: `4px solid ${isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'}`,
            }}
          />
          <style>{`
            @keyframes tooltipFadeIn {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(4px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(8px);
              }
            }
            @keyframes tooltipFadeOut {
              from {
                opacity: 1;
                transform: translateX(-50%) translateY(8px);
              }
              to {
                opacity: 0;
                transform: translateX(-50%) translateY(12px);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

// ============== 类型定义 ==============

interface CosmicNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

// ============== 组件实现 ==============

const CosmicNavigation: React.FC<CosmicNavigationProps> = ({
  currentPage,
  onPageChange,
  children
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 菜单数据 - 添加子菜单结构
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      path: '/dashboard',
      children: [
        {
          key: 'overview',
          icon: <BarChartOutlined />,
          label: '概览',
          path: '/dashboard/overview'
        },
        {
          key: 'analytics',
          icon: <MonitorOutlined />,
          label: '数据分析',
          path: '/dashboard/analytics'
        }
      ]
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统模块',
      path: '/system',
      children: [
        {
          key: 'system-user',
          icon: <UserOutlined />,
          label: '用户管理',
          path: '/system/user'
        },
        {
          key: 'system-resource',
          icon: <DatabaseOutlined />,
          label: '资源管理',
          path: '/system/resource'
        },
        {
          key: 'system-role',
          icon: <SafetyOutlined />,
          label: '角色管理',
          path: '/system/role'
        },
        {
          key: 'system-department',
          icon: <TeamOutlined />,
          label: '部门管理',
          path: '/system/department'
        },
        {
          key: 'system-employee',
          icon: <CustomerServiceOutlined />,
          label: '员工管理',
          path: '/system/employee'
        }
      ]
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: '订单中心',
      path: '/orders',
      children: [
        {
          key: 'order-list',
          icon: <MoneyCollectOutlined />,
          label: '订单列表',
          path: '/orders/list'
        },
        {
          key: 'order-analysis',
          icon: <BarChartOutlined />,
          label: '订单分析',
          path: '/orders/analysis'
        }
      ]
    }
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    onPageChange(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    console.log('用户菜单点击:', key);
    // 实现具体业务逻辑
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    console.log('搜索:', value);
    // 实现搜索功能
  };

  // 星空背景效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{x: number; y: number; size: number; speed: number}> = [];
    const starCount = 200;

    // 初始化星星
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        ctx.fillStyle = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
          : `rgba(102, 126, 234, ${Math.random() * 0.6 + 0.2})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDarkMode]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 星空背景 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* 玻璃拟态头部 */}
      <GlassHeader isDark={isDarkMode}>
        {/* 左侧：折叠按钮 + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              height: 40,
              width: 40,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.65)'
            }}
          />

          <CosmicLogo isDark={isDarkMode}>
            <UniverseLifeLogo size={36} isDark={isDarkMode} className="logo-icon" />
            <div className="logo-text">
              <h3>Universe Life</h3>
              <p>万象生活</p>
            </div>
          </CosmicLogo>
        </div>

        {/* 中间：搜索框 */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <CosmicSearch
            isDark={isDarkMode}
            placeholder="探索宇宙的无限可能..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={handleSearch}
          />
        </div>

        {/* 右侧：功能按钮 */}
        <Space size={16}>
          {/* 主题切换 */}
          <ThemeTooltip
            isDark={isDarkMode}
            text={tooltipText || (isDarkMode ? '当前：夜间模式' : '当前：日间模式')}
            visible={tooltipVisible}
            onVisibleChange={setTooltipVisible}
          >
            <NeonButton
              isDark={isDarkMode}
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => {
                // 显示切换提示
                setTooltipText(isDarkMode ? '已切换至日间模式' : '已切换至夜间模式');
                setTooltipVisible(true);
                toggleTheme();
                // 2秒后自动隐藏
                setTimeout(() => {
                  setTooltipVisible(false);
                  setTooltipText(''); // 清除临时文本
                }, 2000);
              }}
            />
          </ThemeTooltip>

          {/* 通知中心 */}
          <Tooltip title="通知中心">
            <Badge count={8} size="small">
              <NeonButton
                isDark={isDarkMode}
                type="text"
                icon={<NotificationOutlined />}
              />
            </Badge>
          </Tooltip>

          {/* 用户菜单 */}
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <UserCard isDark={isDarkMode}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{
                  background: 'transparent',
                  border: isDarkMode ? '2px solid rgba(255, 255, 255, 0.6)' : '2px solid #667eea',
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#667eea',
                }}
              />
              <div className="user-info">
                <span className="user-name">宇宙管理员</span>
                <span className="user-email">admin@universe.life</span>
              </div>
            </UserCard>
          </Dropdown>
        </Space>
      </GlassHeader>

      {/* 星空侧边栏 */}
      <CosmicSider
        isDark={isDarkMode}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={256}
        collapsedWidth={80}
        trigger={null}
      >
        <CosmicMenu
          isDark={isDarkMode}
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </CosmicSider>

      {/* 主内容区域 */}
      <CosmicContent isDark={isDarkMode} siderWidth={collapsed ? 80 : 256}>
        {children}
      </CosmicContent>
    </Layout>
  );
};

export default CosmicNavigation;