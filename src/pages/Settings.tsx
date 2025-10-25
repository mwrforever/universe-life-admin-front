/**
 * 系统设置页面
 */

import React, { useEffect } from 'react'
import { Card, Typography, Form, Input, Switch, Button, Select, InputNumber, Divider, Space, message, Upload, Row, Col, Radio } from 'antd'
import { useTheme } from '../contexts/ThemeContext'
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined,
  MailOutlined,
  SecurityScanOutlined,
  BellOutlined,
  GlobalOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'

const { Title, Text } = Typography
const { TextArea } = Input

interface SystemSettings {
  siteName: string
  siteDescription: string
  logoUrl: string
  adminEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  sessionTimeout: number
  maxFileSize: number
  backupFrequency: string
  timezone: string
  language: string
}

function Settings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const { theme: themeMode, setThemeMode } = useTheme()

  useEffect(() => {
    console.log('⚙️ 系统设置组件已挂载')
    // 初始化表单数据
    form.setFieldsValue({
      siteName: '万象生活管理系统',
      siteDescription: '专业的企业级后台管理平台',
      adminEmail: 'admin@wanxiang.com',
      maintenanceMode: false,
      allowRegistration: true,
      emailNotifications: true,
      smsNotifications: false,
      sessionTimeout: 120,
      maxFileSize: 10,
      backupFrequency: 'daily',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN'
    })
  }, [form])

  const handleSave = async (values: SystemSettings) => {
    setLoading(true)
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('保存设置:', values)
      message.success('系统设置保存成功！')
    } catch (error) {
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    message.info('已重置为默认设置')
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!')
        return false
      }
      return false // 阻止自动上传
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    }
  }

  return (
    <>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          ⚙️ 系统设置
        </Title>
        <Text type="secondary">
          配置系统参数和功能选项
        </Text>
      </div>

      {/* 设置表单 */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: '100%' }}
      >
        <Row gutter={[24, 24]}>
          {/* 基本设置 */}
          <Col xs={24} lg={12}>
            <Card title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GlobalOutlined />
                基本设置
              </div>
            }>
              <Form.Item
                label="站点名称"
                name="siteName"
                rules={[{ required: true, message: '请输入站点名称' }]}
              >
                <Input placeholder="请输入站点名称" />
              </Form.Item>

              <Form.Item
                label="站点描述"
                name="siteDescription"
                rules={[{ required: true, message: '请输入站点描述' }]}
              >
                <TextArea rows={3} placeholder="请输入站点描述" />
              </Form.Item>

              <Form.Item
                label="站点Logo"
                name="logoUrl"
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>上传Logo</Button>
                  </Upload>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    建议尺寸: 200x50px, 大小不超过2MB
                  </Text>
                </div>
              </Form.Item>

              <Form.Item
                label="管理员邮箱"
                name="adminEmail"
                rules={[
                  { required: true, message: '请输入管理员邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="admin@example.com" />
              </Form.Item>

              <Divider />

              <Form.Item
                label="系统维护模式"
                name="maintenanceMode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                开启后，普通用户将无法访问系统，只有管理员可以登录
              </Text>

              <Form.Item
                label="允许用户注册"
                name="allowRegistration"
                valuePropName="checked"
                style={{ marginTop: '16px' }}
              >
                <Switch />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                关闭后，新用户无法自行注册，只能由管理员添加
              </Text>
            </Card>
          </Col>

          {/* 通知设置 */}
          <Col xs={24} lg={12}>
            <Card title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellOutlined />
                通知设置
              </div>
            }>
              <Form.Item
                label="邮件通知"
                name="emailNotifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                开启后，系统将发送重要通知到管理员邮箱
              </Text>

              <Form.Item
                label="短信通知"
                name="smsNotifications"
                valuePropName="checked"
                style={{ marginTop: '16px' }}
              >
                <Switch />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                开启后，紧急事件将通过短信通知管理员
              </Text>

              <Divider />

              <Form.Item
                label="会话超时时间（分钟）"
                name="sessionTimeout"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <InputNumber
                  min={5}
                  max={1440}
                  style={{ width: '100%' }}
                  placeholder="120"
                />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                用户无操作自动退出登录的时间间隔
              </Text>

              <Form.Item
                label="最大文件上传大小（MB）"
                name="maxFileSize"
                rules={[{ required: true, message: '请输入最大文件大小' }]}
                style={{ marginTop: '16px' }}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="10"
                />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                限制用户上传文件的最大大小
              </Text>
            </Card>
          </Col>

          {/* 系统配置 */}
          <Col xs={24} lg={12}>
            <Card title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SecurityScanOutlined />
                系统配置
              </div>
            }>
              <Form.Item
                label="数据备份频率"
                name="backupFrequency"
                rules={[{ required: true, message: '请选择备份频率' }]}
              >
                <Select>
                  <Select.Option value="hourly">每小时</Select.Option>
                  <Select.Option value="daily">每天</Select.Option>
                  <Select.Option value="weekly">每周</Select.Option>
                  <Select.Option value="monthly">每月</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="系统时区"
                name="timezone"
                rules={[{ required: true, message: '请选择时区' }]}
              >
                <Select>
                  <Select.Option value="Asia/Shanghai">亚洲/上海 (UTC+8)</Select.Option>
                  <Select.Option value="Asia/Tokyo">亚洲/东京 (UTC+9)</Select.Option>
                  <Select.Option value="UTC">协调世界时 (UTC)</Select.Option>
                  <Select.Option value="America/New_York">美国/纽约 (UTC-5)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="系统语言"
                name="language"
                rules={[{ required: true, message: '请选择系统语言' }]}
              >
                <Select>
                  <Select.Option value="zh-CN">简体中文</Select.Option>
                  <Select.Option value="zh-TW">繁体中文</Select.Option>
                  <Select.Option value="en-US">English</Select.Option>
                  <Select.Option value="ja-JP">日本語</Select.Option>
                </Select>
              </Form.Item>

              <Divider />

              <Form.Item label="主题模式">
                <Radio.Group
                  value={themeMode}
                  onChange={(e) => setThemeMode(e.target.value)}
                  size="large"
                >
                  <Radio.Button value="light">
                    <Space>
                      🌞
                      浅色模式
                    </Space>
                  </Radio.Button>
                  <Radio.Button value="dark">
                    <Space>
                      🌙
                      深色模式
                    </Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                选择您喜欢的界面主题，可以随时切换
              </Text>
            </Card>
          </Col>

          {/* 用户管理设置 */}
          <Col xs={24} lg={12}>
            <Card title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TeamOutlined />
                用户管理设置
              </div>
            }>
              <Form.Item
                label="默认用户角色"
                name="defaultRole"
              >
                <Select defaultValue="user">
                  <Select.Option value="user">普通用户</Select.Option>
                  <Select.Option value="vip">VIP用户</Select.Option>
                  <Select.Option value="member">会员用户</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="密码最小长度"
                name="minPasswordLength"
              >
                <InputNumber
                  min={6}
                  max={20}
                  defaultValue={8}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="允许同时登录设备数"
                name="maxDevices"
              >
                <InputNumber
                  min={1}
                  max={10}
                  defaultValue={3}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Text type="secondary" style={{ fontSize: '12px' }}>
                同一账号最多允许同时登录的设备数量
              </Text>
            </Card>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Card style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                操作确认
              </Title>
              <Text type="secondary">
                保存设置将立即生效，请谨慎操作
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置设置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存设置
              </Button>
            </Space>
          </div>
        </Card>
      </Form>
    </>
  )
}

export default Settings