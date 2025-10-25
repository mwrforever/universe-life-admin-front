/**
 * 创建AI服务页面
 */

import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Select, Upload, message, Space, Row, Col, InputNumber, Switch } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { UploadProps } from 'antd'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

interface ConfigField {
  key: string
  name: string
  type: string
  required: boolean
  description: string
}

const CreateAIService: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [configFields, setConfigFields] = useState<ConfigField[]>([])
  const navigate = useNavigate()

  const serviceTypes = [
    { value: 'chatbot', label: '聊天机器人', description: '基于大语言模型的对话系统' },
    { value: 'image_generation', label: '图像生成', description: 'AI图像生成和编辑服务' },
    { value: 'text_analysis', label: '文本分析', description: '自然语言处理和文本理解' },
    { value: 'voice_synthesis', label: '语音合成', description: '文字转语音服务' },
    { value: 'recommendation', label: '推荐系统', description: '个性化推荐算法引擎' }
  ]

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // 这里应该调用API创建AI服务
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...values,
          configFields,
          status: 'inactive'
        }),
      })

      if (response.ok) {
        message.success('AI服务创建成功')
        navigate('/ai')
      } else {
        throw new Error('创建失败')
      }
    } catch (error) {
      message.error('创建AI服务失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAddConfigField = () => {
    const newField: ConfigField = {
      key: `field_${Date.now()}`,
      name: '',
      type: 'string',
      required: false,
      description: ''
    }
    setConfigFields([...configFields, newField])
  }

  const handleRemoveConfigField = (key: string) => {
    setConfigFields(configFields.filter(field => field.key !== key))
  }

  const handleConfigFieldChange = (key: string, field: string, value: any) => {
    setConfigFields(configFields.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ))
  }

  const handleCancel = () => {
    navigate('/ai')
  }

  const uploadProps: UploadProps = {
    name: 'file',
    action: `${import.meta.env.VITE_API_BASE_URL}/upload`,
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`)
      }
    },
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            style={{ marginRight: '16px' }}
          >
            返回
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            创建AI服务
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{ maxWidth: '800px' }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="服务名称"
                rules={[
                  { required: true, message: '请输入服务名称!' },
                  { min: 2, message: '服务名称至少2个字符!' }
                ]}
              >
                <Input placeholder="请输入AI服务名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="服务类型"
                rules={[{ required: true, message: '请选择服务类型!' }]}
              >
                <Select placeholder="请选择AI服务类型">
                  {serviceTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{type.label}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="服务描述"
            rules={[
              { required: true, message: '请输入服务描述!' },
              { min: 10, message: '服务描述至少10个字符!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述AI服务的功能、用途和特点..."
            />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="apiEndpoint"
                label="API端点"
                rules={[
                  { required: true, message: '请输入API端点!' },
                  { pattern: /^\/api\/.*/, message: 'API端点必须以 /api/ 开头' }
                ]}
              >
                <Input placeholder="例如: /api/ai/chatbot" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[{ required: true, message: '请输入版本号!' }]}
                initialValue="v1.0.0"
              >
                <Input placeholder="例如: v1.0.0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="maxConcurrency"
                label="最大并发数"
                rules={[{ required: true, message: '请输入最大并发数!' }]}
                initialValue={100}
              >
                <InputNumber
                  min={1}
                  max={10000}
                  style={{ width: '100%' }}
                  placeholder="最大并发请求数"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="timeout"
                label="超时时间(秒)"
                rules={[{ required: true, message: '请输入超时时间!' }]}
                initialValue={30}
              >
                <InputNumber
                  min={1}
                  max={300}
                  style={{ width: '100%' }}
                  placeholder="请求超时时间"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cost"
                label="月费用(元)"
                rules={[{ required: true, message: '请输入月费用!' }]}
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="服务月费用"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="modelFile"
            label="模型文件"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传模型文件</Button>
            </Upload>
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              支持 .pkl, .onnx, .h5, .pt 等格式，文件大小不超过 2GB
            </div>
          </Form.Item>

          <Form.Item
            name="autoStart"
            label="自动启动"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              创建成功后自动启动服务
            </div>
          </Form.Item>

          {/* 配置字段 */}
          <Card
            title="配置参数"
            size="small"
            style={{ marginBottom: '16px' }}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                size="small"
                onClick={handleAddConfigField}
              >
                添加配置
              </Button>
            }
          >
            {configFields.map((field, index) => (
              <Row key={field.key} gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={6}>
                  <Input
                    placeholder="参数名"
                    value={field.name}
                    onChange={(e) => handleConfigFieldChange(field.key, 'name', e.target.value)}
                  />
                </Col>
                <Col span={5}>
                  <Select
                    placeholder="参数类型"
                    value={field.type}
                    onChange={(value) => handleConfigFieldChange(field.key, 'type', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="string">字符串</Option>
                    <Option value="number">数字</Option>
                    <Option value="boolean">布尔值</Option>
                    <Option value="array">数组</Option>
                    <Option value="object">对象</Option>
                  </Select>
                </Col>
                <Col span={7}>
                  <Input
                    placeholder="参数描述"
                    value={field.description}
                    onChange={(e) => handleConfigFieldChange(field.key, 'description', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Switch
                    checkedChildren="必填"
                    unCheckedChildren="选填"
                    checked={field.required}
                    onChange={(checked) => handleConfigFieldChange(field.key, 'required', checked)}
                    style={{ marginTop: '4px' }}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveConfigField(field.key)}
                  />
                </Col>
              </Row>
            ))}
            {configFields.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无配置参数，点击上方按钮添加
              </div>
            )}
          </Card>

          <Form.Item>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                创建服务
              </Button>
              <Button onClick={handleCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CreateAIService