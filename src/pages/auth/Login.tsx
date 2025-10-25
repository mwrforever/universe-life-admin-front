/**
 * 万象生活登录页面
 * 高级设计感登录界面，支持手机号/用户名/邮箱登录 + 第三方登录
 */

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Checkbox, Alert, Divider, Space, Card } from 'antd'
import { WanXiangIcon } from '@/components/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import { login } from '@/store/slices/authSlice'
import './Login.css'

const { Title, Text } = Typography

interface LoginFormData {
  identifier: string // 手机号/用户名/邮箱
  password: string
  remember: boolean
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    remember: false
  })

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // 背景动画效果
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / 1000
      const root = document.documentElement
      root.style.setProperty('--animation-time', time.toString())
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const handleAccountLogin = async (values: LoginFormData) => {
    setLoading(true)
    setError('')

    try {
      // 模拟API调用
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success || true) { // 临时模拟成功
        // 存储用户信息和token
        dispatch(login({
          user: {
            id: 1,
            username: values.identifier,
            email: 'admin@wanxiang.com',
            role: 'admin'
          },
          token: 'mock_token_' + Date.now(),
        }))

        // 如果选择记住密码，存储到localStorage
        if (values.remember) {
          localStorage.setItem('auth_token', data.token || 'mock_token')
          localStorage.setItem('user_info', JSON.stringify(data.user || {
            id: 1,
            username: values.identifier,
            email: 'admin@wanxiang.com',
            role: 'admin'
          }))
        }

        navigate('/dashboard')
      } else {
        setError(data.error || '登录失败，请重试')
      }
    } catch (error) {
      console.error('Login error:', error)
      // 临时允许直接登录进行测试
      dispatch(login({
        user: {
          id: 1,
          username: values.identifier || 'admin',
          email: 'admin@wanxiang.com',
          role: 'admin'
        },
        token: 'mock_token_' + Date.now(),
      }))
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleThirdPartyLogin = (platform: string) => {
    console.log(`使用 ${platform} 登录`)
    // TODO: 集成第三方登录SDK
    setError('第三方登录功能开发中...')
  }

  return (
    <div className="wan-login-page">
      {/* 动态背景 */}
      <div className="wan-login-background">
        <div className="wan-bg-shape wan-bg-shape-1"></div>
        <div className="wan-bg-shape wan-bg-shape-2"></div>
        <div className="wan-bg-shape wan-bg-shape-3"></div>
        <div className="wan-bg-shape wan-bg-shape-4"></div>
      </div>

      {/* 登录容器 */}
      <div className="wan-login-container">
        <Card className="wan-login-card wan-glass-card">
          {/* 头部品牌区域 */}
          <div className="wan-login-header">
            <div className="wan-brand-logo">
              <div className="wan-logo-container">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="wan-logo-svg">
                  <circle cx="30" cy="30" r="28" stroke="url(#brand-gradient)" strokeWidth="4" strokeDasharray="8 4" strokeDashoffset="var(--animation-time, 0)"/>
                  <path d="M30 18v12l8 6" stroke="url(#brand-gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="30" cy="30" r="3" fill="url(#brand-gradient)"/>
                  <defs>
                    <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea"/>
                      <stop offset="50%" stopColor="#ff6b6b"/>
                      <stop offset="100%" stopColor="#feca57"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="wan-brand-text">
              <Title level={2} className="wan-login-title">
                万象生活
              </Title>
              <Text className="wan-login-subtitle">
                智慧管理，精彩生活
              </Text>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="wan-login-error"
              closable
              onClose={() => setError('')}
            />
          )}

          {/* 登录表单 */}
          <Form
            name="login"
            initialValues={formData}
            onFinish={handleAccountLogin}
            layout="vertical"
            size="large"
            className="wan-login-form"
          >
            <Form.Item
              name="identifier"
              label={<span className="wan-form-label">账号</span>}
              rules={[
                { required: true, message: '请输入手机号/用户名/邮箱!' },
                { min: 3, message: '账号至少3个字符!' }
              ]}
            >
              <Input
                prefix={<WanXiangIcon type="User" color="#8b5cf6" />}
                placeholder="手机号/用户名/邮箱"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="wan-input-field"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="wan-form-label">密码</span>}
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6个字符!' }
              ]}
            >
              <Input.Password
                prefix={<WanXiangIcon type="Settings" color="#8b5cf6" />}
                placeholder="密码"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="wan-input-field"
              />
            </Form.Item>

            <div className="wan-login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="wan-checkbox">记住我</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="wan-forgot-link">
                忘记密码？
              </Link>
            </div>

            <Form.Item className="wan-submit-item">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="wan-login-button"
              >
                {loading ? '登录中...' : '立即登录'}
              </Button>
            </Form.Item>
          </Form>

          {/* 分隔线 */}
          <div className="wan-divider-wrapper">
            <Divider className="wan-divider">
              <span className="wan-divider-text">或使用以下方式登录</span>
            </Divider>
          </div>

          {/* 第三方登录 */}
          <div className="wan-social-login">
            <Space size="middle" className="wan-social-buttons">
              <Button
                className="wan-social-btn wan-wechat-btn"
                onClick={() => handleThirdPartyLogin('微信')}
                icon={<WanXiangIcon type="Wechat" />}
              >
                微信
              </Button>
              <Button
                className="wan-social-btn wan-qq-btn"
                onClick={() => handleThirdPartyLogin('QQ')}
                icon={<WanXiangIcon type="QQ" />}
              >
                QQ
              </Button>
              <Button
                className="wan-social-btn wan-alipay-btn"
                onClick={() => handleThirdPartyLogin('支付宝')}
                icon={<WanXiangIcon type="Alipay" />}
              >
                支付宝
              </Button>
            </Space>
          </div>

          {/* 注册链接 */}
          <div className="wan-register-section">
            <Text className="wan-register-text">
              还没有商务账号？
              <Link to="/register" className="wan-register-link">
                立即申请
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login