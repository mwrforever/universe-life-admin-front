/**
 * 个人资料弹窗
 * 用于展示和编辑当前登录用户的个人信息
 * 使用缓存的用户资料数据，支持手动刷新
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  Tag,
  message,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ReloadOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '@/context/ThemeContext';
import { sysUserProfileApi } from '@/services/system';
import type { SysUserProfileVO, UpdateProfileRequest } from '@/services/system/sysUserProfileApi';
import { Gender } from '@/services/system/types';
import { AvatarUpload } from '@/components/System';
import { TokenManager } from '@/services/auth/tokenManager';
import { useSignedAvatar } from '@/hooks/useSignedAvatar';
import { useAuth } from '@/hooks/useAuth';

// ============== 样式组件 ==============

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const InfoSection = styled.div`
  margin-top: 16px;
`;

const ReadOnlyField = styled.div<{ $isDark: boolean }>`
  padding: 8px 12px;
  background: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.04)' 
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 8px;
  border: 1px solid ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.06)'};
  color: ${props => props.$isDark 
    ? 'rgba(255, 255, 255, 0.85)' 
    : 'rgba(0, 0, 0, 0.85)'};
  min-height: 40px;
  display: flex;
  align-items: center;
`;

const DepartmentTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;


const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ============== 组件接口 ==============

export interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ============== 组件实现 ==============

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { isDarkMode } = useTheme();
  const { profile: cachedProfile, refreshProfile, isRefreshing } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<SysUserProfileVO | null>(null);
  const [originalProfile, setOriginalProfile] = useState<SysUserProfileVO | null>(null);
  
  // 使用签名头像 Hook
  const { signedUrl: signedAvatarUrl, refresh: refreshAvatar } = useSignedAvatar(profile?.avatarUrl);

  /**
   * 从缓存加载用户资料
   */
  const loadFromCache = useCallback(() => {
    if (cachedProfile) {
      setProfile(cachedProfile);
      setOriginalProfile(cachedProfile);
      form.setFieldsValue({
        username: cachedProfile.username,
        realName: cachedProfile.realName,
        phone: cachedProfile.phone,
        email: cachedProfile.email,
        gender: cachedProfile.gender,
        avatarUrl: cachedProfile.avatarUrl,
      });
    }
  }, [cachedProfile, form]);

  // 弹窗打开时从缓存加载
  useEffect(() => {
    if (open) {
      loadFromCache();
      setIsEditing(false);
    }
  }, [open, loadFromCache]);

  /**
   * 刷新资料
   */
  const handleRefresh = async () => {
    try {
      await refreshProfile();
      refreshAvatar();
      message.success('资料已刷新');
    } catch (error) {
      message.error('刷新失败');
    }
  };

  /**
   * 进入编辑模式
   */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setIsEditing(false);
    if (originalProfile) {
      form.setFieldsValue({
        username: originalProfile.username,
        realName: originalProfile.realName,
        phone: originalProfile.phone,
        email: originalProfile.email,
        gender: originalProfile.gender,
        avatarUrl: originalProfile.avatarUrl,
      });
      setProfile(originalProfile);
    }
  };

  /**
   * 保存修改
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      const updateData: UpdateProfileRequest = {
        username: values.username,
        realName: values.realName,
        phone: values.phone,
        email: values.email,
        gender: values.gender,
        avatarUrl: values.avatarUrl,
      };
      
      const res = await sysUserProfileApi.updatePersonProfile(updateData);
      if (res.code === 1) {
        message.success('保存成功');
        setIsEditing(false);
        
        // 更新缓存
        TokenManager.updateUserProfile({
          ...profile,
          ...updateData,
        } as SysUserProfileVO);
        
        const updatedProfile = { ...profile, ...updateData } as SysUserProfileVO;
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  /**
   * 头像变更
   */
  const handleAvatarChange = (key: string) => {
    form.setFieldValue('avatarUrl', key);
    setProfile(prev => prev ? { ...prev, avatarUrl: key } : null);
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  };

  const modalTitle = (
    <ModalTitle>
      <UserOutlined />
      <span>个人资料</span>
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
          disabled={isEditing || isRefreshing}
        >
          刷新
        </Button>
        {!isEditing ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            编辑
          </Button>
        ) : (
          <>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              保存
            </Button>
          </>
        )}
      </Space>
    );
  };


  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleClose}
      footer={renderFooter()}
      width={700}
      destroyOnClose
    >
      {isRefreshing ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>暂无用户资料</p>
          <Button type="primary" onClick={handleRefresh}>
            加载资料
          </Button>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          {/* 头像区域 */}
          <AvatarSection>
            {isEditing ? (
              <Form.Item name="avatarUrl" noStyle>
                <AvatarUpload
                  value={form.getFieldValue('avatarUrl')}
                  onChange={handleAvatarChange}
                  size={100}
                />
              </Form.Item>
            ) : (
              <AvatarUpload
                value={signedAvatarUrl || profile?.avatarUrl}
                size={100}
                disabled
              />
            )}
          </AvatarSection>

          <Divider style={{ margin: '16px 0' }} />

          {/* 只读信息 */}
          <InfoSection>
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12}>
                <Form.Item label={<><IdcardOutlined /> 工号</>} style={{ marginBottom: 12 }}>
                  <ReadOnlyField $isDark={isDarkMode}>
                    {profile?.employeeNo || '-'}
                  </ReadOnlyField>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={<><TeamOutlined /> 部门</>} style={{ marginBottom: 12 }}>
                  <ReadOnlyField $isDark={isDarkMode}>
                    <DepartmentTags>
                      {profile?.departments?.map(dept => (
                        <Tag 
                          key={dept.id} 
                          color={dept.id === profile.primaryDepartment?.id ? 'blue' : 'default'}
                        >
                          {dept.deptName}
                          {dept.id === profile.primaryDepartment?.id && ' (主)'}
                        </Tag>
                      )) || '-'}
                    </DepartmentTags>
                  </ReadOnlyField>
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>

          <Divider style={{ margin: '16px 0' }} />

          {/* 可编辑信息 */}
          <InfoSection>
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                  style={{ marginBottom: 12 }}
                >
                  {isEditing ? (
                    <Input placeholder="请输入用户名" />
                  ) : (
                    <ReadOnlyField $isDark={isDarkMode}>
                      {profile?.username || '-'}
                    </ReadOnlyField>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="realName" label="真实姓名" style={{ marginBottom: 12 }}>
                  {isEditing ? (
                    <Input placeholder="请输入真实姓名" />
                  ) : (
                    <ReadOnlyField $isDark={isDarkMode}>
                      {profile?.realName || '-'}
                    </ReadOnlyField>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label={<><PhoneOutlined /> 手机号</>}
                  rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
                  style={{ marginBottom: 12 }}
                >
                  {isEditing ? (
                    <Input placeholder="请输入手机号" />
                  ) : (
                    <ReadOnlyField $isDark={isDarkMode}>
                      {profile?.phone || '-'}
                    </ReadOnlyField>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label={<><MailOutlined /> 邮箱</>}
                  rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
                  style={{ marginBottom: 12 }}
                >
                  {isEditing ? (
                    <Input placeholder="请输入邮箱" />
                  ) : (
                    <ReadOnlyField $isDark={isDarkMode}>
                      {profile?.email || '-'}
                    </ReadOnlyField>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="gender" label="性别" style={{ marginBottom: 12 }}>
                  {isEditing ? (
                    <Select placeholder="请选择性别">
                      <Select.Option value={Gender.SECRET}>保密</Select.Option>
                      <Select.Option value={Gender.MALE}>男</Select.Option>
                      <Select.Option value={Gender.FEMALE}>女</Select.Option>
                    </Select>
                  ) : (
                    <ReadOnlyField $isDark={isDarkMode}>
                      {profile?.gender === Gender.MALE ? '男' : 
                       profile?.gender === Gender.FEMALE ? '女' : '保密'}
                    </ReadOnlyField>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </InfoSection>
        </Form>
      )}
    </Modal>
  );
};

export default ProfileModal;
