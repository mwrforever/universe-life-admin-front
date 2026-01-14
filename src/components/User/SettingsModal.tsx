/**
 * 账户设置弹窗
 * 用于展示账户信息和修改密码
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Spin,
  Divider,
  Row,
  Col,
  Radio,
  message,
  Descriptions,
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  IdcardOutlined,
  UserOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '@/context/ThemeContext';
import { sysUserProfileApi, VerificationType } from '@/services/system';
import type { SysUserProfileVO, UpdatePasswordRequest } from '@/services/system/sysUserProfileApi';
import { sendVerifyCode, CaptchaUsageType, UserAuthType } from '@/services/auth/authApi';
import { useAuth } from '@/hooks/useAuth';

// ============== 样式组件 ==============

const VerificationSelector = styled(Radio.Group)`
  width: 100%;
  margin-bottom: 16px;
  
  .ant-radio-button-wrapper {
    flex: 1;
    text-align: center;
    height: 40px;
    line-height: 38px;
  }
`;

const MaskedText = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.65)' 
    : 'rgba(0, 0, 0, 0.65)'};
  font-size: 14px;
`;

const CaptchaInputGroup = styled.div`
  display: flex;
  gap: 12px;
  
  .ant-input {
    flex: 1;
  }
  
  .ant-btn {
    min-width: 110px;
  }
`;

const SectionTitle = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin-bottom: 16px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'};
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ============== 工具函数 ==============

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const maskEmail = (email: string): string => {
  if (!email) return email;
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length > 2 
    ? name[0] + '***' + name[name.length - 1]
    : name[0] + '***';
  return `${maskedName}@${domain}`;
};

// ============== 组件接口 ==============

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// ============== 组件实现 ==============

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const { isDarkMode } = useTheme();
  const { profile: cachedProfile, refreshProfile, isRefreshing } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<SysUserProfileVO | null>(null);
  const [verificationType, setVerificationType] = useState<VerificationType>(VerificationType.PASSWORD);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // 从缓存加载
  useEffect(() => {
    if (open && cachedProfile) {
      setProfile(cachedProfile);
      form.resetFields();
      setVerificationType(VerificationType.PASSWORD);
    }
  }, [open, cachedProfile, form]);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * 刷新资料
   */
  const handleRefresh = async () => {
    try {
      await refreshProfile();
      message.success('资料已刷新');
    } catch (error) {
      message.error('刷新失败');
    }
  };

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    if (!profile) return;
    
    const identification = verificationType === VerificationType.EMAIL_CAPTCHA 
      ? profile.email 
      : profile.phone;
    
    if (!identification) {
      message.error(verificationType === VerificationType.EMAIL_CAPTCHA 
        ? '未绑定邮箱，无法使用邮箱验证' 
        : '未绑定手机号，无法使用手机验证');
      return;
    }

    setSendingCode(true);
    try {
      const res = await sendVerifyCode({
        identification,
        identificationType: verificationType === VerificationType.EMAIL_CAPTCHA 
          ? UserAuthType.Email 
          : UserAuthType.Phone,
        captchaUsageType: CaptchaUsageType.ResetPassword,
      });
      
      if (res.code === 1) {
        message.success('验证码已发送');
        setCountdown(60);
      } else {
        message.error(res.message || '发送验证码失败');
      }
    } catch (error) {
      message.error('发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  /**
   * 提交密码修改
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }

      setSaving(true);
      
      const updateData: UpdatePasswordRequest = {
        verificationType,
        newPassword: values.newPassword,
      };

      if (verificationType === VerificationType.PASSWORD) {
        updateData.currentPassword = values.currentPassword;
      } else {
        updateData.captcha = values.captcha;
        updateData.captchaUsageType = CaptchaUsageType.ResetPassword;
      }

      const res = await sysUserProfileApi.updatePersonPassword(updateData);
      if (res.code === 1) {
        message.success('密码修改成功');
        form.resetFields();
        onClose();
      } else {
        message.error(res.message || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 验证方式变更
   */
  const handleVerificationTypeChange = (type: VerificationType) => {
    setVerificationType(type);
    form.resetFields(['currentPassword', 'captcha']);
  };

  const modalTitle = (
    <ModalTitle>
      <SettingOutlined />
      <span>账户设置</span>
    </ModalTitle>
  );

  /**
   * 渲染底部按钮
   */
  const renderFooter = () => {
    if (isRefreshing || !profile) return null;
    
    return (
      <Space>
        <Button
          icon={<ReloadOutlined spin={isRefreshing} />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          刷新
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={saving}
          icon={<SafetyOutlined />}
        >
          确认修改
        </Button>
      </Space>
    );
  };


  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onClose}
      footer={renderFooter()}
      width={600}
      destroyOnClose
    >
      {isRefreshing ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>暂无账户信息</p>
          <Button type="primary" onClick={handleRefresh}>
            加载信息
          </Button>
        </div>
      ) : (
        <>
          {/* 账户信息 */}
          <SectionTitle $isDark={isDarkMode}>
            <UserOutlined />
            账户信息
          </SectionTitle>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
            <Descriptions.Item label={<><IdcardOutlined /> 工号</>}>
              {profile?.employeeNo || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined /> 用户名</>}>
              {profile?.username || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined /> 上次登录</>}>
              {profile?.lastLoginAt || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><GlobalOutlined /> 登录IP</>}>
              {profile?.lastLoginIp || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 修改密码 */}
          <SectionTitle $isDark={isDarkMode}>
            <LockOutlined />
            修改密码
          </SectionTitle>

          {/* 验证方式选择 */}
          <VerificationSelector
            value={verificationType}
            onChange={(e) => handleVerificationTypeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value={VerificationType.PASSWORD}>
              <SafetyOutlined /> 原密码
            </Radio.Button>
            <Radio.Button 
              value={VerificationType.EMAIL_CAPTCHA}
              disabled={!profile?.email}
            >
              <MailOutlined /> 邮箱
            </Radio.Button>
            <Radio.Button 
              value={VerificationType.PHONE_CAPTCHA}
              disabled={!profile?.phone}
            >
              <PhoneOutlined /> 手机
            </Radio.Button>
          </VerificationSelector>

          <Form form={form} layout="vertical">
            {/* 原密码验证 */}
            {verificationType === VerificationType.PASSWORD && (
              <Form.Item
                name="currentPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>
            )}

            {/* 邮箱验证码 */}
            {verificationType === VerificationType.EMAIL_CAPTCHA && (
              <>
                <Form.Item label="验证邮箱">
                  <MaskedText $isDark={isDarkMode}>
                    {maskEmail(profile?.email || '')}
                  </MaskedText>
                </Form.Item>
                <Form.Item
                  name="captcha"
                  label="验证码"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <CaptchaInputGroup>
                    <Input placeholder="请输入验证码" maxLength={6} />
                    <Button
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      loading={sendingCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </CaptchaInputGroup>
                </Form.Item>
              </>
            )}

            {/* 手机验证码 */}
            {verificationType === VerificationType.PHONE_CAPTCHA && (
              <>
                <Form.Item label="验证手机">
                  <MaskedText $isDark={isDarkMode}>
                    {maskPhone(profile?.phone || '')}
                  </MaskedText>
                </Form.Item>
                <Form.Item
                  name="captcha"
                  label="验证码"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <CaptchaInputGroup>
                    <Input placeholder="请输入验证码" maxLength={6} />
                    <Button
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      loading={sendingCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </CaptchaInputGroup>
                </Form.Item>
              </>
            )}

            <Divider />

            {/* 新密码 */}
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码至少6位' },
                  ]}
                >
                  <Input.Password placeholder="请输入新密码" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请再次输入新密码" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default SettingsModal;
