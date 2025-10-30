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
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons'

interface WanXiangIconProps {
  type: string
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

// 微博自定义图标组件
const WeiboOutlined: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={style}
  >
    <path d="M10.098 20.323c-3.977.39-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443z"/>
    <path d="M14.4 8.521c-.273 0-.531-.053-.771-.149-.533-.212-.895-.595-1.086-1.135-.19-.54-.155-1.119.098-1.629.253-.51.697-.882 1.248-1.043.55-.161 1.13-.078 1.628.232.498.31.842.795.969 1.363.128.568.027 1.154-.284 1.65-.253.406-.636.721-1.089.889-.239.089-.487.134-.736.134h-.007l.03-.312z"/>
    <path d="M18.373 9.313c-.649 0-1.255-.191-1.734-.52-.735-.506-1.205-1.274-1.291-2.139-.086-.865.232-1.708.861-2.336.629-.629 1.472-.947 2.336-.861.865.086 1.633.556 2.139 1.291.506.735.653 1.647.401 2.507-.252.86-.822 1.563-1.618 1.981-.521.269-1.089.405-1.674.405-.144 0-.289-.008-.434-.025l.014-.303z"/>
    <path d="M9.547 13.8c-1.454 0-2.798-.456-3.783-1.279-.985-.823-1.529-1.921-1.529-3.093 0-1.172.544-2.27 1.529-3.093.985-.823 2.329-1.279 3.783-1.279s2.798.456 3.783 1.279c.985.823 1.529 1.921 1.529 3.093 0 1.172-.544 2.27-1.529 3.093-.985.823-2.329 1.279-3.783 1.279z"/>
  </svg>
)

const WanXiangIcon: React.FC<WanXiangIconProps> = ({ type, size = 16, color, className, style }) => {
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
    Lock: <LockOutlined />,
    Phone: <PhoneOutlined />,
    Email: <MailOutlined />,
    Menu: <MenuOutlined />,
    Notification: <NotificationOutlined />,
    ArrowDown: <ArrowDownOutlined />,
    Wechat: <WechatOutlined />,
    QQ: <QqOutlined />,
    Alipay: <AlipayOutlined />,
    Weibo: <WeiboOutlined />,
    Question: <QuestionCircleOutlined />,
    Help: <QuestionCircleOutlined />,
    Logout: <LogoutOutlined />,
  }

  const icon = iconMap[type] || <SettingOutlined />

  const iconStyle: React.CSSProperties = {
    fontSize: size,
    color,
    ...style,
  }

  return React.cloneElement(icon as React.ReactElement, {
    style: iconStyle,
    className,
  } as any)
}

export default WanXiangIcon