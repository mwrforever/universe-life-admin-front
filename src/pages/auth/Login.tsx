/**
 * 万象生活登录页面
 * 高级设计感登录界面，支持手机号/用户名/邮箱登录 + 第三方登录
 */

import React, { useState, useEffect, useRef } from 'react'
import { Form, Input, Button, Typography, Checkbox, Alert, Divider, Space, Card, Tabs } from 'antd'
import { WanXiangIcon } from '@/components/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '@/store'
import { login } from '@/store/slices/authSlice'
import './Login.css'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface LoginFormData {
  identifier: string // 手机号/用户名/邮箱
  password: string
  remember: boolean
}

interface CodeLoginFormData {
  phone: string
  email: string
  code: string
  remember: boolean
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('account')
  const [codeLoginType, setCodeLoginType] = useState<'phone' | 'email'>('phone')
  const [countdown, setCountdown] = useState(0)

  // Form引用，用于重置表单状态
  const accountFormRef = useRef<any>(null)
  const phoneFormRef = useRef<any>(null)
  const emailFormRef = useRef<any>(null)

  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    remember: false
  })

  const [codeFormData, setCodeFormData] = useState<CodeLoginFormData>({
    phone: '',
    email: '',
    code: '',
    remember: false
  })

  // 字段级错误状态
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string
    password?: string
    phone?: string
    email?: string
    code?: string
  }>({})

  // 清除所有错误
  const clearAllErrors = () => {
    setFieldErrors({})
  }

  // 清除所有表单状态（包括Ant Design Form内部的错误状态）
  const clearAllFormStates = () => {
    clearAllErrors()
    // 重置所有表单的内部状态
    accountFormRef.current?.resetFields()
    phoneFormRef.current?.resetFields()
    emailFormRef.current?.resetFields()
  }

  // 清除特定字段的错误
  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName as keyof typeof newErrors]
      return newErrors
    })
  }

  // 设置单个字段错误（确保每个字段只显示一条错误）
  const setFieldError = (fieldName: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  // 统一的验证函数
  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case 'phone':
        if (!value) return '请输入手机号'
        if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号格式'
        return null
      case 'email':
        if (!value) return '请输入邮箱'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '请输入正确的邮箱格式'
        return null
      case 'code':
        if (!value) return '请输入验证码'
        if (value.length !== 6) return '验证码为6位数字'
        return null
      default:
        return null
    }
  }

  // 实时验证函数
  const validateFieldRealtime = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value)
    if (error) {
      setFieldError(fieldName, error)
    } else {
      clearFieldError(fieldName)
    }
  }

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

  // 倒计时处理
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleAccountLogin = async (values: LoginFormData) => {
    setLoading(true)
    clearAllErrors()

    // 手动验证所有字段
    const identifierError = !values.identifier ? '请输入手机号/用户名/邮箱' :
                          values.identifier.length < 3 ? '账号至少3个字符' : null
    const passwordError = !values.password ? '请输入密码' :
                         values.password.length < 6 ? '密码至少6个字符' : null

    if (identifierError) {
      setFieldError('identifier', identifierError)
    }
    if (passwordError) {
      setFieldError('password', passwordError)
    }

    if (identifierError || passwordError) {
      setLoading(false)
      return
    }

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
          token: `mock_token_${Date.now()}`,
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
        // 根据错误类型设置字段级错误
        const errorCode = data.error || '登录失败'
        if (errorCode.includes('用户名') || errorCode.includes('账号') || errorCode.includes('不存在')) {
          setFieldError('identifier', data.error || '用户名或密码错误')
        } else if (errorCode.includes('密码') || errorCode.includes('登录失败')) {
          setFieldError('password', data.error || '用户名或密码错误')
        } else {
          setFieldError('identifier', data.error || '登录失败，请重试')
        }
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
        token: `mock_token_${Date.now()}`,
      }))
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleThirdPartyLogin = (platform: string) => {
    console.log(`使用 ${platform} 登录`)
    // TODO: 集成第三方登录SDK
    setFieldError('identifier', '第三方登录功能开发中...')
  }

  // 发送验证码
  const handleSendCode = async () => {
    const target = codeLoginType === 'phone' ? codeFormData.phone : codeFormData.email
    const fieldName = codeLoginType === 'phone' ? 'phone' : 'email'

    // 清除之前的错误
    clearFieldError(fieldName)
    clearFieldError('code')

    // 使用统一验证
    const error = validateField(fieldName, target)
    if (error) {
      setFieldError(fieldName, error)
      return
    }

    try {
      // 模拟发送验证码
      console.log(`发送验证码到: ${target}`)
      setCountdown(60)
    } catch (error) {
      setFieldError(fieldName, '发送验证码失败，请重试')
    }
  }

  // 验证码登录
  const handleCodeLogin = async (values: CodeLoginFormData) => {
    setLoading(true)
    clearAllErrors()

    const target = codeLoginType === 'phone' ? values.phone : values.email
    const fieldName = codeLoginType === 'phone' ? 'phone' : 'email'

    // 使用统一验证
    const fieldError = validateField(fieldName, target)
    if (fieldError) {
      setFieldError(fieldName, fieldError)
      setLoading(false)
      return
    }

    const codeError = validateField('code', values.code)
    if (codeError) {
      setFieldError('code', codeError)
      setLoading(false)
      return
    }

    try {
      // 模拟验证码登录API调用
      console.log('验证码登录:', { target, code: values.code })

      // 临时模拟成功
      dispatch(login({
        user: {
          id: 1,
          username: target,
          email: target.includes('@') ? target : 'user@wanxiang.com',
          role: 'admin'
        },
        token: `mock_token_${Date.now()}`,
      }))

      if (values.remember) {
        localStorage.setItem('auth_token', `mock_token_${Date.now()}`)
        localStorage.setItem('user_info', JSON.stringify({
          id: 1,
          username: target,
          email: target.includes('@') ? target : 'user@wanxiang.com',
          role: 'admin'
        }))
      }

      navigate('/dashboard')
    } catch (error) {
      console.error('验证码登录错误:', error)
      setFieldError('code', '登录失败，请重试')
    } finally {
      setLoading(false)
    }
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

  
          {/* 登录表单 */}
          <Tabs
            activeKey={activeTab === 'code' ? codeLoginType : activeTab}
            onChange={(key) => {
              if (key === 'account') {
                setActiveTab('account')
                clearAllFormStates() // 彻底清除所有表单状态和错误
              } else {
                setActiveTab('code')
                setCodeLoginType(key as 'phone' | 'email')
                clearAllFormStates() // 彻底清除所有表单状态和错误
              }
            }}
            className="wan-login-tabs"
            size="large"
            centered
          >
            <TabPane tab="账号密码" key="account">
              <Form
                ref={accountFormRef}
                name="login"
                initialValues={formData}
                onFinish={handleAccountLogin}
                layout="vertical"
                size="large"
                className="wan-login-form"
                onValuesChange={(changedValues) => {
                  // 实时验证
                  Object.keys(changedValues).forEach(fieldName => {
                    const value = changedValues[fieldName]
                    if (fieldName === 'identifier') {
                      if (value && value.length >= 3) {
                        clearFieldError(fieldName)
                      } else if (value) {
                        setFieldError(fieldName, '账号至少3个字符')
                      }
                    } else if (fieldName === 'password') {
                      if (value && value.length >= 6) {
                        clearFieldError(fieldName)
                      } else if (value) {
                        setFieldError(fieldName, '密码至少6个字符')
                      }
                    }
                  })
                }}
              >
                <Form.Item
                  name="identifier"
                  label={<span className="wan-form-label">账号</span>}
                >
                  <div>
                    <Input
                      prefix={<WanXiangIcon type="User" color="#8b5cf6" />}
                      placeholder="手机号/用户名/邮箱"
                      value={formData.identifier}
                      onChange={(e) => {
                      setFormData({ ...formData, identifier: e.target.value })
                      // 实时验证
                      validateFieldRealtime('identifier', e.target.value)
                    }}
                      className={`wan-input-field ${fieldErrors.identifier ? 'error' : ''}`}
                    />
                    {fieldErrors.identifier && (
                      <div className="wan-field-error">{fieldErrors.identifier}</div>
                    )}
                  </div>
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="wan-form-label">密码</span>}
                >
                  <div>
                    <Input.Password
                      prefix={<WanXiangIcon type="Security" color="#8b5cf6" />}
                      placeholder="密码"
                      value={formData.password}
                      onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      // 实时验证
                      if (e.target.value && e.target.value.length >= 6) {
                        clearFieldError('password')
                      } else if (e.target.value) {
                        setFieldError('password', '密码至少6个字符')
                      }
                    }}
                      className={`wan-input-field ${fieldErrors.password ? 'error' : ''}`}
                    />
                    {fieldErrors.password && (
                      <div className="wan-field-error">{fieldErrors.password}</div>
                    )}
                  </div>
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
            </TabPane>

            <TabPane tab="手机号验证" key="phone">
              <Form
                ref={phoneFormRef}
                name="phoneCodeLogin"
                onFinish={(values) => {
                  const phoneData = { ...values, phone: values.phone || values.phone }
                  handleCodeLogin(phoneData)
                }}
                layout="vertical"
                size="large"
                className="wan-login-form"
                onValuesChange={(changedValues) => {
                  // 实时验证
                  Object.keys(changedValues).forEach(fieldName => {
                    const value = changedValues[fieldName]
                    if (fieldName === 'phone' || fieldName === 'code') {
                      validateFieldRealtime(fieldName, value)
                    }
                  })
                }}
              >
                <Form.Item
                  name="phone"
                  label={<span className="wan-form-label">手机号</span>}
                >
                  <div>
                    <Input
                      prefix={<WanXiangIcon type="Phone" color="#8b5cf6" />}
                      placeholder="请输入手机号"
                      value={codeFormData.phone}
                      onChange={(e) => {
                      setCodeFormData({ ...codeFormData, phone: e.target.value })
                      // 实时验证
                      validateFieldRealtime('phone', e.target.value)
                    }}
                      className={`wan-input-field ${fieldErrors.phone ? 'error' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <div className="wan-field-error">{fieldErrors.phone}</div>
                    )}
                  </div>
                </Form.Item>

                <Form.Item
                  name="code"
                  label={<span className="wan-form-label">验证码</span>}
                                  >
                  <div>
                    <div className="wan-code-input-wrapper">
                      <Input
                        prefix={<WanXiangIcon type="Security" color="#8b5cf6" />}
                        placeholder="请输入验证码"
                        value={codeFormData.code}
                        onChange={(e) => {
                          setCodeFormData({ ...codeFormData, code: e.target.value })
                          // 实时验证
                          validateFieldRealtime('code', e.target.value)
                        }}
                        className={`wan-input-field wan-code-input ${fieldErrors.code ? 'error' : ''}`}
                        maxLength={6}
                      />
                      <Button
                        type="default"
                        size="large"
                        onClick={() => {
                          setCodeLoginType('phone')
                          handleSendCode()
                        }}
                        disabled={countdown > 0}
                        className="wan-send-code-btn"
                      >
                        {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                      </Button>
                    </div>
                    {fieldErrors.code && (
                      <div className="wan-field-error">{fieldErrors.code}</div>
                    )}
                  </div>
                </Form.Item>

                <div className="wan-login-options">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="wan-checkbox">记住我</Checkbox>
                  </Form.Item>
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
            </TabPane>

            <TabPane tab="邮箱验证" key="email">
              <Form
                ref={emailFormRef}
                name="emailCodeLogin"
                onFinish={(values) => {
                  const emailData = { ...values, email: values.email || values.email }
                  handleCodeLogin(emailData)
                }}
                layout="vertical"
                size="large"
                className="wan-login-form"
                onValuesChange={(changedValues) => {
                  // 实时验证
                  Object.keys(changedValues).forEach(fieldName => {
                    const value = changedValues[fieldName]
                    if (fieldName === 'email' || fieldName === 'code') {
                      validateFieldRealtime(fieldName, value)
                    }
                  })
                }}
              >
                <Form.Item
                  name="email"
                  label={<span className="wan-form-label">邮箱</span>}
                >
                  <div>
                    <Input
                      prefix={<WanXiangIcon type="Email" color="#8b5cf6" />}
                      placeholder="请输入邮箱"
                      value={codeFormData.email}
                      onChange={(e) => {
                      setCodeFormData({ ...codeFormData, email: e.target.value })
                      // 实时验证
                      validateFieldRealtime('email', e.target.value)
                    }}
                      className={`wan-input-field ${fieldErrors.email ? 'error' : ''}`}
                    />
                    {fieldErrors.email && (
                      <div className="wan-field-error">{fieldErrors.email}</div>
                    )}
                  </div>
                </Form.Item>

                <Form.Item
                  name="code"
                  label={<span className="wan-form-label">验证码</span>}
                                  >
                  <div>
                    <div className="wan-code-input-wrapper">
                      <Input
                        prefix={<WanXiangIcon type="Security" color="#8b5cf6" />}
                        placeholder="请输入验证码"
                        value={codeFormData.code}
                        onChange={(e) => {
                          setCodeFormData({ ...codeFormData, code: e.target.value })
                          // 实时验证
                          validateFieldRealtime('code', e.target.value)
                        }}
                        className={`wan-input-field wan-code-input ${fieldErrors.code ? 'error' : ''}`}
                        maxLength={6}
                      />
                      <Button
                        type="default"
                        size="large"
                        onClick={() => {
                          setCodeLoginType('email')
                          handleSendCode()
                        }}
                        disabled={countdown > 0}
                        className="wan-send-code-btn"
                      >
                        {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                      </Button>
                    </div>
                    {fieldErrors.code && (
                      <div className="wan-field-error">{fieldErrors.code}</div>
                    )}
                  </div>
                </Form.Item>

                <div className="wan-login-options">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="wan-checkbox">记住我</Checkbox>
                  </Form.Item>
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
            </TabPane>
          </Tabs>

          {/* 分隔线 */}
          <div className="wan-divider-wrapper">
            <Divider className="wan-divider">
              <span className="wan-divider-text">或使用以下方式登录</span>
            </Divider>
          </div>

          {/* 第三方登录 */}
          <div className="wan-social-login">
            <div className="wan-social-grid">
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
              <Button
                className="wan-social-btn wan-weibo-btn"
                onClick={() => handleThirdPartyLogin('微博')}
                icon={<WanXiangIcon type="Weibo" />}
              >
                微博
              </Button>
            </div>
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