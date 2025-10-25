/**
 * 忘记密码页面
 */

import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Steps } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography
const { Step } = Steps

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSendResetLink = async (values: any) => {
    setLoading(true)
    setError('')
    setEmail(values.email)

    try {
      // 这里应该调用API发送重置密码链接
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentStep(1)
        setSuccess(true)
      } else {
        setError(data.error || '发送失败，请重试')
      }
    } catch (error) {
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: '输入邮箱',
      content: '请输入您的邮箱地址，我们将发送重置密码链接',
    },
    {
      title: '发送成功',
      content: `重置密码链接已发送到 ${email}，请检查您的邮箱`,
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            忘记密码
          </Title>
          <Text type="secondary">
            重置您的账户密码
          </Text>
        </div>

        <Steps current={currentStep} style={{ marginBottom: '30px' }}>
          {steps.map((step) => (
            <Step
              key={step.title}
              title={step.title}
              icon={currentStep === 1 && step.title === '发送成功' ? <CheckCircleOutlined /> : undefined}
            />
          ))}
        </Steps>

        <div style={{ marginBottom: '20px' }}>
          <Text type="secondary">{steps[currentStep].content}</Text>
        </div>

        {currentStep === 0 && (
          <Form
            name="forgotPassword"
            onFinish={handleSendResetLink}
            layout="vertical"
            size="large"
          >
            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '20px' }}
                closable
                onClose={() => setError('')}
              />
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱地址!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入您的邮箱地址"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  width: '100%',
                  height: '45px',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                发送重置链接
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <div style={{ textAlign: 'center' }}>
            {success && (
              <Alert
                message="重置链接已发送"
                description="请检查您的邮箱并点击重置链接来设置新密码"
                type="success"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}
            <Button
              type="default"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                height: '45px',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              返回登录
            </Button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Text type="secondary">
            想起密码了？ <a href="/login" style={{ color: '#1890ff' }}>返回登录</a>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default ForgotPassword