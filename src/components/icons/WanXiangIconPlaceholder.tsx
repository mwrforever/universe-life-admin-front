/**
 * 万象图标组件占位符
 * 使用Ant Design Icons作为临时替代
 */

import React from 'react'
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuOutlined,
  NotificationOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  SafetyOutlined,
  LineChartOutlined,
  WechatOutlined,
  QqOutlined,
  AlipayOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

interface WanXiangIconProps {
  type: string
  size?: number
  color?: string
}

const WanXiangIcon: React.FC<WanXiangIconProps> = ({ type, size = 16, color }) => {
  const iconMap: Record<string, React.ReactElement> = {
    Home: <HomeOutlined />,
    User: <UserOutlined />,
    Task: <FileTextOutlined />,
    FileText: <FileTextOutlined />,
    CreditCard: <CreditCardOutlined />,
    Wallet: <WalletOutlined />,
    Payment: <CreditCardOutlined />,
    Message: <MessageOutlined />,
    Chat: <MessageOutlined />,
    BarChart: <BarChartOutlined />,
    Chart: <LineChartOutlined />,
    Settings: <SettingOutlined />,
    Security: <SafetyOutlined />,
    Menu: <MenuOutlined />,
    Notification: <NotificationOutlined />,
    ArrowDown: <ArrowDownOutlined />,
    Wechat: <WechatOutlined />,
    QQ: <QqOutlined />,
    Alipay: <AlipayOutlined />,
    Question: <QuestionCircleOutlined />,
    Help: <QuestionCircleOutlined />,
    Logout: <LogoutOutlined />,
  }

  const icon = iconMap[type] || <SettingOutlined />

  const iconStyle: React.CSSProperties = {
    fontSize: size,
    color,
  }

  return React.cloneElement(icon as React.ReactElement<any>, {
    style: iconStyle,
  })
}

export default WanXiangIcon