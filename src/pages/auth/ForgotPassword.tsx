/**
 * 万象生活忘记密码页面
 * 支持原密码、手机号、邮箱验证码多种方式重置密码
 */

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Alert, Steps, Card, message } from 'antd'
import { WanXiangIcon } from '@/components/icons'
import { useNavigate, Link } from 'react-router-dom'
import './ForgotPassword.css'

const { Title, Text } = Typography
const { Step } = Steps

interface ForgotPasswordFormData {
  currentPassword?: string
  phone?: string
  email?: string
  verificationCode?: string
  newPassword: string
  confirmPassword: string
}

type ResetMethod = 'password' | 'phone' | 'email'
type StepType = 1 | 2 | 3

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [resetMethod, setResetMethod] = useState<ResetMethod>('password')
  const [countdown, setCountdown] = useState(0)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    newPassword: '',
    confirmPassword: ''
  })

  // 字段级错误状态
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string
    phone?: string
    email?: string
    verificationCode?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const navigate = useNavigate()

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

  // 密码强度检测
  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  // 方法选择
  const handleMethodSelect = (method: ResetMethod) => {
    setResetMethod(method)
    setFieldErrors({})
    setCurrentStep(2)
  }

  // 发送验证码
  const handleSendCode = async () => {
    const target = resetMethod === 'phone' ? formData.phone : formData.email
    const fieldName = resetMethod === 'phone' ? 'phone' : 'email'

    // 清除之前的错误
    setFieldErrors(prev => ({ ...prev, [fieldName]: '', verificationCode: '' }))

    if (!target) {
      setFieldErrors({ [fieldName]: `请输入${resetMethod === 'phone' ? '手机号' : '邮箱'}` })
      return
    }

    if (resetMethod === 'phone' && !/^1[3-9]\d{9}$/.test(target)) {
      setFieldErrors({ phone: '请输入正确的手机号格式' })
      return
    }

    if (resetMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setFieldErrors({ email: '请输入正确的邮箱格式' })
      return
    }

    try {
      console.log(`发送验证码到: ${target}`)
      setCountdown(60)
      message.success('验证码已发送')
    } catch (error) {
      setFieldErrors({ [fieldName]: '发送验证码失败，请重试' })
    }
  }

  // 验证身份
  const handleIdentityVerification = async () => {
    setLoading(true)
    setFieldErrors({})

    try {
      if (resetMethod === 'password' && !formData.currentPassword) {
        setFieldErrors({ currentPassword: '请输入当前密码' })
        setLoading(false)
        return
      }

      if ((resetMethod === 'phone' || resetMethod === 'email') && !formData.verificationCode) {
        setFieldErrors({ verificationCode: '请输入验证码' })
        setLoading(false)
        return
      }

      // 模拟验证 API 调用
      console.log('验证身份:', { method: resetMethod, data: formData })

      // 验证成功，进入下一步
      setCurrentStep(3)
    } catch (error) {
      const fieldName = resetMethod === 'password' ? 'currentPassword' : 'verificationCode'
      setFieldErrors({ [fieldName]: '身份验证失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handlePasswordReset = async () => {
    setLoading(true)
    setFieldErrors({})

    if (!formData.newPassword) {
      setFieldErrors({ newPassword: '请输入新密码' })
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: '两次输入的密码不一致' })
      setLoading(false)
      return
    }

    if (passwordStrength < 3) {
      setFieldErrors({ newPassword: '密码强度不够，请包含字母、数字和特殊字符' })
      setLoading(false)
      return
    }

    try {
      // 模拟重置密码 API 调用
      console.log('重置密码:', { newPassword: formData.newPassword })

      message.success('密码重置成功，请重新登录')
      navigate('/login')
    } catch (error) {
      setFieldErrors({ newPassword: '密码重置失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  // 密码强度指示器
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return { text: '弱', color: '#ff4d4f' }
      case 2: return { text: '一般', color: '#faad14' }
      case 3: return { text: '较强', color: '#52c41a' }
      case 4:
      case 5: return { text: '强', color: '#52c41a' }
      default: return { text: '弱', color: '#ff4d4f' }
    }
  }

  const strengthInfo = getPasswordStrengthText()

  return (
    <div className="wan-forgot-password-page">
      {/* 动态背景 */}
      <div className="wan-login-background">
        <div className="wan-bg-shape wan-bg-shape-1"></div>
        <div className="wan-bg-shape wan-bg-shape-2"></div>
        <div className="wan-bg-shape wan-bg-shape-3"></div>
        <div className="wan-bg-shape wan-bg-shape-4"></div>
      </div>

      {/* 忘记密码容器 */}
      <div className="wan-forgot-password-container">
        <Card className="wan-forgot-password-card wan-glass-card">
          {/* 头部 */}
          <div className="wan-forgot-password-header">
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
                重置密码
              </Title>
              <Text className="wan-login-subtitle">
                选择一种方式验证您的身份
              </Text>
            </div>
          </div>

          
          {/* 步骤条 */}
          <div className="wan-steps-wrapper">
            <Steps current={currentStep - 1} size="small" className="wan-password-steps">
              <Step title="选择方式" />
              <Step title="验证身份" />
              <Step title="设置新密码" />
            </Steps>
          </div>

          {/* 步骤1：选择重置方式 */}
          {currentStep === 1 && (
            <div className="wan-method-selection">
              <div className="wan-method-cards">
                <div
                  className={`wan-method-card ${resetMethod === 'password' ? 'active' : ''}`}
                  onClick={() => handleMethodSelect('password')}
                >
                  <div className="wan-method-icon">
                    <WanXiangIcon type="Lock" color="#8b5cf6" size={32} />
                  </div>
                  <div className="wan-method-content">
                    <Title level={4}>当前密码验证</Title>
                    <Text>通过输入当前密码验证身份</Text>
                  </div>
                </div>

                <div
                  className={`wan-method-card ${resetMethod === 'phone' ? 'active' : ''}`}
                  onClick={() => handleMethodSelect('phone')}
                >
                  <div className="wan-method-icon">
                    <WanXiangIcon type="Phone" color="#8b5cf6" size={32} />
                  </div>
                  <div className="wan-method-content">
                    <Title level={4}>手机号验证</Title>
                    <Text>通过手机验证码验证身份</Text>
                  </div>
                </div>

                <div
                  className={`wan-method-card ${resetMethod === 'email' ? 'active' : ''}`}
                  onClick={() => handleMethodSelect('email')}
                >
                  <div className="wan-method-icon">
                    <WanXiangIcon type="Email" color="#8b5cf6" size={32} />
                  </div>
                  <div className="wan-method-content">
                    <Title level={4}>邮箱验证</Title>
                    <Text>通过邮箱验证码验证身份</Text>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤2：身份验证 */}
          {currentStep === 2 && (
            <Form
              layout="vertical"
              size="large"
              className="wan-forgot-password-form"
              onValuesChange={(changedValues) => {
                // 当表单值变化时，清除相关字段的错误
                Object.keys(changedValues).forEach(fieldName => {
                  if (fieldErrors[fieldName as keyof typeof fieldErrors]) {
                    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }))
                  }
                })
              }}
            >
              {resetMethod === 'password' && (
                <Form.Item
                  label={<span className="wan-form-label">当前密码</span>}
                  rules={[
                    { required: true, message: '请输入当前密码!' }
                  ]}
                >
                  <div>
                    <Input.Password
                      prefix={<WanXiangIcon type="Lock" color="#8b5cf6" />}
                      placeholder="请输入当前密码"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className={`wan-input-field ${fieldErrors.currentPassword ? 'error' : ''}`}
                    />
                    {fieldErrors.currentPassword && (
                      <div className="wan-field-error">{fieldErrors.currentPassword}</div>
                    )}
                  </div>
                </Form.Item>
              )}

              {resetMethod === 'phone' && (
                <>
                  <Form.Item
                    label={<span className="wan-form-label">手机号</span>}
                    rules={[
                      { required: true, message: '请输入手机号!' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式!' }
                    ]}
                  >
                    <div>
                      <Input
                        prefix={<WanXiangIcon type="Phone" color="#8b5cf6" />}
                        placeholder="请输入手机号"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value })
                          // 清除该字段的错误
                          if (fieldErrors.phone) {
                            setFieldErrors(prev => ({ ...prev, phone: '' }))
                          }
                        }}
                        className={`wan-input-field ${fieldErrors.phone ? 'error' : ''}`}
                      />
                      {fieldErrors.phone && (
                        <div className="wan-field-error">{fieldErrors.phone}</div>
                      )}
                    </div>
                  </Form.Item>
                  <Form.Item
                    label={<span className="wan-form-label">验证码</span>}
                    rules={[
                      { required: true, message: '请输入验证码!' },
                      { len: 6, message: '验证码为6位数字!' },
                      { pattern: /^\d{6}$/, message: '验证码必须为6位数字!' }
                    ]}
                  >
                    <div>
                      <div className="wan-code-input-wrapper">
                        <Input
                          prefix={<WanXiangIcon type="Security" color="#8b5cf6" />}
                          placeholder="请输入验证码"
                          value={formData.verificationCode}
                          onChange={(e) => {
                            setFormData({ ...formData, verificationCode: e.target.value })
                            // 清除该字段的错误
                            if (fieldErrors.verificationCode) {
                              setFieldErrors(prev => ({ ...prev, verificationCode: '' }))
                            }
                          }}
                          className={`wan-input-field wan-code-input ${fieldErrors.verificationCode ? 'error' : ''}`}
                          maxLength={6}
                        />
                        <Button
                          type="default"
                          size="large"
                          onClick={handleSendCode}
                          disabled={countdown > 0}
                          className="wan-send-code-btn"
                        >
                          {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                        </Button>
                      </div>
                      {fieldErrors.verificationCode && (
                        <div className="wan-field-error">{fieldErrors.verificationCode}</div>
                      )}
                    </div>
                  </Form.Item>
                </>
              )}

              {resetMethod === 'email' && (
                <>
                  <Form.Item
                    label={<span className="wan-form-label">邮箱</span>}
                    rules={[
                      { required: true, message: '请输入邮箱!' },
                      { type: 'email', message: '请输入正确的邮箱格式!' }
                    ]}
                  >
                    <div>
                      <Input
                        prefix={<WanXiangIcon type="Email" color="#8b5cf6" />}
                        placeholder="请输入邮箱"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          // 清除该字段的错误
                          if (fieldErrors.email) {
                            setFieldErrors(prev => ({ ...prev, email: '' }))
                          }
                        }}
                        className={`wan-input-field ${fieldErrors.email ? 'error' : ''}`}
                      />
                      {fieldErrors.email && (
                        <div className="wan-field-error">{fieldErrors.email}</div>
                      )}
                    </div>
                  </Form.Item>
                  <Form.Item
                    label={<span className="wan-form-label">验证码</span>}
                    rules={[
                      { required: true, message: '请输入验证码!' },
                      { len: 6, message: '验证码为6位数字!' },
                      { pattern: /^\d{6}$/, message: '验证码必须为6位数字!' }
                    ]}
                  >
                    <div>
                      <div className="wan-code-input-wrapper">
                        <Input
                          prefix={<WanXiangIcon type="Security" color="#8b5cf6" />}
                          placeholder="请输入验证码"
                          value={formData.verificationCode}
                          onChange={(e) => {
                            setFormData({ ...formData, verificationCode: e.target.value })
                            // 清除该字段的错误
                            if (fieldErrors.verificationCode) {
                              setFieldErrors(prev => ({ ...prev, verificationCode: '' }))
                            }
                          }}
                          className={`wan-input-field wan-code-input ${fieldErrors.verificationCode ? 'error' : ''}`}
                          maxLength={6}
                        />
                        <Button
                          type="default"
                          size="large"
                          onClick={handleSendCode}
                          disabled={countdown > 0}
                          className="wan-send-code-btn"
                        >
                          {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                        </Button>
                      </div>
                      {fieldErrors.verificationCode && (
                        <div className="wan-field-error">{fieldErrors.verificationCode}</div>
                      )}
                    </div>
                  </Form.Item>
                </>
              )}

              <div className="wan-form-actions">
                <Button
                  type="default"
                  onClick={() => setCurrentStep(1)}
                  className="wan-back-button"
                >
                  上一步
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleIdentityVerification}
                  className="wan-next-button"
                >
                  验证身份
                </Button>
              </div>
            </Form>
          )}

          {/* 步骤3：设置新密码 */}
          {currentStep === 3 && (
            <Form
              layout="vertical"
              size="large"
              className="wan-forgot-password-form"
            >
              <Form.Item
                label={<span className="wan-form-label">新密码</span>}
                rules={[
                  { required: true, message: '请输入新密码!' },
                  { min: 8, message: '密码至少8个字符!' },
                  { max: 50, message: '密码最多50个字符!' }
                ]}
              >
                <div>
                  <Input.Password
                    prefix={<WanXiangIcon type="Lock" color="#8b5cf6" />}
                    placeholder="请输入新密码"
                    value={formData.newPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, newPassword: e.target.value })
                      setPasswordStrength(checkPasswordStrength(e.target.value))
                      // 清除该字段的错误
                      if (fieldErrors.newPassword) {
                        setFieldErrors(prev => ({ ...prev, newPassword: '' }))
                      }
                    }}
                    className={`wan-input-field ${fieldErrors.newPassword ? 'error' : ''}`}
                  />
                  {formData.newPassword && (
                    <div className="wan-password-strength">
                      <div className="wan-strength-bar">
                        <div
                          className="wan-strength-fill"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: strengthInfo.color
                          }}
                        ></div>
                      </div>
                      <Text style={{ color: strengthInfo.color, fontSize: '12px' }}>
                        密码强度: {strengthInfo.text}
                      </Text>
                    </div>
                  )}
                  {fieldErrors.newPassword && (
                    <div className="wan-field-error">{fieldErrors.newPassword}</div>
                  )}
                </div>
              </Form.Item>

              <Form.Item
                label={<span className="wan-form-label">确认新密码</span>}
                rules={[
                  { required: true, message: '请确认新密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致!'))
                    },
                  }),
                ]}
              >
                <div>
                  <Input.Password
                    prefix={<WanXiangIcon type="Lock" color="#8b5cf6" />}
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      // 清除该字段的错误
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }
                    }}
                    className={`wan-input-field ${fieldErrors.confirmPassword ? 'error' : ''}`}
                  />
                  {fieldErrors.confirmPassword && (
                    <div className="wan-field-error">{fieldErrors.confirmPassword}</div>
                  )}
                </div>
              </Form.Item>

              <div className="wan-form-actions">
                <Button
                  type="default"
                  onClick={() => setCurrentStep(2)}
                  className="wan-back-button"
                >
                  上一步
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handlePasswordReset}
                  className="wan-reset-button"
                >
                  重置密码
                </Button>
              </div>
            </Form>
          )}

          {/* 返回登录链接 */}
          <div className="wan-back-to-login">
            <Text className="wan-back-text">
              记起密码了？
              <Link to="/login" className="wan-back-link">
                返回登录
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword