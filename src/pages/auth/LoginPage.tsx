/**
 * 登录页面
 * 支持密码登录和验证码登录两种方式
 * 极简主义现代化设计风格
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tabs, message, theme } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { authApi, TokenManager } from '@/services/auth';
import { authLogger } from '@/utils/logger';

type LoginType = 'password' | 'code';

interface PasswordFormData {
  identification: string;
  password: string;
}

interface CodeFormData {
  identification: string;
  verifyCode: string;
}

// 页面容器
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
`;

// 左侧品牌区域
const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #f7f9fc;
  padding: 80px;
  position: relative;
  overflow: hidden;

  /* 装饰背景圆 */
  &::after {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 60%;
    height: 60%;
    background-color: #e6f7ff;
    border-radius: 50%;
    opacity: 0.6;
    z-index: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    bottom: -5%;
    left: -5%;
    width: 40%;
    height: 40%;
    background-color: #f0f5ff;
    border-radius: 50%;
    opacity: 0.8;
    z-index: 0;
  }

  @media (max-width: 1000px) {
    display: none;
  }
`;

const BrandHeader = styled.div`
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandLogo = styled.div`
  width: 40px;
  height: 40px;
  background-color: #1677ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const BrandName = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  letter-spacing: -0.5px;
`;

const BrandContent = styled.div`
  z-index: 1;
  max-width: 480px;
`;

const HeroTitle = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -1px;

  span {
    color: #1677ff;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 48px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
`;

const FeatureItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1677ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
`;

const FeatureText = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
  }
  p {
    font-size: 14px;
    color: #888;
    line-height: 1.4;
  }
`;

const Copyright = styled.div`
  z-index: 1;
  font-size: 14px;
  color: #999;
`;

// 右侧登录区域
const RightSection = styled.div`
  width: 560px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  background: white;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.02);
  z-index: 10;

  @media (max-width: 1000px) {
    width: 100%;
    padding: 40px 24px;
    box-shadow: none;
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
`;

const WelcomeHeader = styled.div`
  margin-bottom: 40px;
  text-align: left;
`;

const WelcomeTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const WelcomeSub = styled.p`
  font-size: 16px;
  color: #888;
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin-bottom: 32px;
    
    &::before {
      border-bottom: 2px solid #f0f0f0;
    }
  }

  .ant-tabs-tab {
    padding: 12px 0;
    font-size: 16px;
    color: #888;
    transition: all 0.3s;
    margin-right: 32px;

    &:hover {
      color: #1677ff;
    }

    &.ant-tabs-tab-active .ant-tabs-tab-btn {
      color: #1677ff;
      font-weight: 600;
    }
  }

  .ant-tabs-ink-bar {
    background: #1677ff;
    height: 3px;
    border-radius: 3px;
  }
`;

const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 24px;
  }

  .ant-input-affix-wrapper {
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #ffffff;
    transition: all 0.2s;

    &:hover {
      border-color: #1677ff;
    }

    &:focus, &.ant-input-affix-wrapper-focused {
      border-color: #1677ff;
      box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1);
    }

    .ant-input {
      font-size: 16px;
      color: #333;
      
      &::placeholder {
        color: #bbb;
      }
    }

    .ant-input-prefix {
      margin-right: 12px;
      color: #999;
      font-size: 18px;
    }
  }
  
  .ant-form-item-explain-error {
    margin-top: 8px;
    font-size: 13px;
  }
`;

const CodeInputGroup = styled.div`
  display: flex;
  gap: 12px;
  
  .ant-form-item {
    flex: 1;
    margin-bottom: 0;
  }
`;

const ActionButton = styled(Button)`
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: none;
  
  &.ant-btn-primary {
    background: #1677ff;
    
    &:hover {
      background: #4096ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &.verify-btn {
    width: 120px;
    font-weight: 500;
    border-color: #e0e0e0;
    color: #666;
    
    &:hover:not(:disabled) {
      color: #1677ff;
      border-color: #1677ff;
    }
  }
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>('password');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [passwordForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  
  // 使用 Ant Design Token
  const { token: _token } = theme.useToken();

  useEffect(() => {
    if (TokenManager.isLoggedIn()) {
      authLogger.info('用户已登录，跳转到首页');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePasswordLogin = useCallback(async (values: PasswordFormData) => {
    setLoading(true);
    try {
      const response = await authApi.loginByPassword({
        identification: values.identification,
        password: values.password,
      }) as any;

      // 检查响应状态
      if (response.code !== 1) {
        message.error(response.message || '登录失败');
        return;
      }

      // 保存Token数据
      TokenManager.saveLoginData(response.data);

      authLogger.info('✅ 密码登录成功');
      message.success('欢迎回来！');
      navigate('/', { replace: true });
    } catch (error: any) {
      authLogger.error('❌ 密码登录失败:', error);
      message.error(error?.response?.data?.message || '账号或密码错误');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleCodeLogin = useCallback(async (values: CodeFormData) => {
    setLoading(true);
    try {
      const response = await authApi.loginByCaptcha({
        identification: values.identification,
        verifyCode: values.verifyCode,
        usageType: 1, // 1-登录验证
      }) as any;

      // 检查响应状态
      if (response.code !== 1) {
        message.error(response.message || '登录失败');
        return;
      }

      // 保存Token数据
      TokenManager.saveLoginData(response.data);

      authLogger.info('✅ 验证码登录成功');
      message.success('欢迎回来！');
      navigate('/', { replace: true });
    } catch (error: any) {
      authLogger.error('❌ 验证码登录失败:', error);
      message.error(error?.response?.data?.message || '验证码错误');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSendCode = useCallback(async () => {
    try {
      const identification = codeForm.getFieldValue('identification');
      if (!identification) {
        message.warning('请先输入手机号或邮箱');
        return;
      }

      // 验证手机号或邮箱格式
      const isPhone = /^1[3-9]\d{9}$/.test(identification);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identification);
      if (!isPhone && !isEmail) {
        message.warning('请输入正确的手机号或邮箱');
        return;
      }

      const response = await authApi.sendVerifyCode({ 
        identification,
        usageType: 1, // 1-登录验证
      }) as any;
      
      if (response.code === 1) {
        message.success('验证码已发送');
        setCountdown(60);
      } else {
        message.error(response.message || '验证码发送失败');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '验证码发送失败');
    }
  }, [codeForm]);

  const tabItems = [
    {
      key: 'password',
      label: '密码登录',
      children: (
        <StyledForm
          form={passwordForm}
          onFinish={(values) => handlePasswordLogin(values as PasswordFormData)}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="identification"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="工号 / 用户名 / 手机号 / 邮箱"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 32 }}>
            <ActionButton type="primary" htmlType="submit" loading={loading} block>
              登 录
            </ActionButton>
          </Form.Item>
        </StyledForm>
      ),
    },
    {
      key: 'code',
      label: '验证码登录',
      children: (
        <StyledForm
          form={codeForm}
          onFinish={(values) => handleCodeLogin(values as CodeFormData)}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="identification"
            rules={[
              { required: true, message: '请输入手机号或邮箱' },
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="手机号 / 邮箱"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 24 }}>
            <CodeInputGroup>
              <Form.Item
                name="verifyCode"
                noStyle
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '验证码为6位数字' },
                ]}
              >
                <Input
                  prefix={<SafetyCertificateOutlined />}
                  placeholder="6位验证码"
                  maxLength={6}
                  size="large"
                />
              </Form.Item>
              <ActionButton
                className="verify-btn"
                disabled={countdown > 0}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `${countdown}s` : '获取'}
              </ActionButton>
            </CodeInputGroup>
          </Form.Item>
          <Form.Item style={{ marginTop: 32 }}>
            <ActionButton type="primary" htmlType="submit" loading={loading} block>
              登 录
            </ActionButton>
          </Form.Item>
        </StyledForm>
      ),
    },
  ];

  return (
    <PageContainer>
      <LeftSection>
        <BrandHeader>
          <BrandLogo>U</BrandLogo>
          <BrandName>Universe Life</BrandName>
        </BrandHeader>
        
        <BrandContent>
          <HeroTitle>
            Manage Your <br />
            <span>Universe</span> Simply.
          </HeroTitle>
          <HeroSubtitle>
            企业级统一身份认证与管理平台，为您提供极简、安全、高效的一站式解决方案。
          </HeroSubtitle>
          
          <FeatureGrid>
            <FeatureItem>
              <FeatureIcon><SafetyOutlined /></FeatureIcon>
              <FeatureText>
                <h3>企业级安全</h3>
                <p>多重认证防护</p>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><ThunderboltOutlined /></FeatureIcon>
              <FeatureText>
                <h3>极速响应</h3>
                <p>毫秒级处理能力</p>
              </FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><GlobalOutlined /></FeatureIcon>
              <FeatureText>
                <h3>全球互联</h3>
                <p>分布式架构部署</p>
              </FeatureText>
            </FeatureItem>
          </FeatureGrid>
        </BrandContent>

        <Copyright>
          © {new Date().getFullYear()} Universe Life Inc. All Rights Reserved.
        </Copyright>
      </LeftSection>

      <RightSection>
        <LoginBox>
          <WelcomeHeader>
            <WelcomeTitle>欢迎回来</WelcomeTitle>
            <WelcomeSub>请填写以下信息以登录您的账户</WelcomeSub>
          </WelcomeHeader>

          <StyledTabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as LoginType)}
            items={tabItems}
          />
        </LoginBox>
      </RightSection>
    </PageContainer>
  );
};

export default LoginPage;
