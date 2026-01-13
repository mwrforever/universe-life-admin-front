/**
 * Token 刷新测试页面
 * 用于测试 OAuth2 Token 刷新功能
 */

import React, { useState, useCallback } from 'react';
import { Card, Button, Space, Typography, Descriptions, message, Alert, Divider, Input } from 'antd';
import {
  ReloadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { TokenManager } from '@/services/auth/tokenManager';
import { OAuth2Service } from '@/services/oauth2/authService';
import { authLogger } from '@/utils/logger';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f5f5;
`;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const TokenDisplay = styled.div`
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
`;

const StatusBadge = styled.span<{ status: 'success' | 'error' | 'warning' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  background: ${({ status }) =>
    status === 'success' ? '#f6ffed' : status === 'error' ? '#fff2f0' : '#fffbe6'};
  color: ${({ status }) =>
    status === 'success' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#faad14'};
  border: 1px solid
    ${({ status }) =>
      status === 'success' ? '#b7eb8f' : status === 'error' ? '#ffccc7' : '#ffe58f'};
`;

const LogContainer = styled.div`
  background: #1e1e1e;
  border-radius: 6px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
`;

const LogEntry = styled.div<{ type: 'info' | 'success' | 'error' | 'warn' }>`
  color: ${({ type }) =>
    type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : type === 'warn' ? '#faad14' : '#d4d4d4'};
  margin-bottom: 4px;
  white-space: pre-wrap;
`;

interface LogItem {
  time: string;
  type: 'info' | 'success' | 'error' | 'warn';
  message: string;
}

const TokenTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [tokenInfo, setTokenInfo] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    isExpired: boolean;
    isLoggedIn: boolean;
  }>({
    accessToken: null,
    refreshToken: null,
    isExpired: true,
    isLoggedIn: false,
  });

  const addLog = useCallback((type: LogItem['type'], msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, type, message: msg }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 刷新 Token 信息显示
  const refreshTokenInfo = useCallback(() => {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    const isExpired = TokenManager.isTokenExpired();
    const isLoggedIn = TokenManager.isLoggedIn();

    setTokenInfo({
      accessToken,
      refreshToken,
      isExpired,
      isLoggedIn,
    });

    addLog('info', `Token 状态已刷新`);
    addLog('info', `Access Token: ${accessToken ? '存在' : '不存在'}`);
    addLog('info', `Refresh Token: ${refreshToken ? '存在' : '不存在'}`);
    addLog('info', `是否过期: ${isExpired ? '是' : '否'}`);
    addLog('info', `是否已登录: ${isLoggedIn ? '是' : '否'}`);
  }, [addLog]);

  // 测试刷新 Token
  const handleRefreshToken = useCallback(async () => {
    setLoading(true);
    addLog('info', '🔄 开始刷新 Token...');
    addLog('info', `请求地址: /oauth2/token -> http://localhost:8099/oauth2/token`);

    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        addLog('error', '❌ 没有可用的 Refresh Token，请先登录');
        message.error('没有可用的 Refresh Token，请先登录');
        return;
      }

      addLog('info', `Refresh Token: ${refreshToken.substring(0, 20)}...`);

      await OAuth2Service.refreshAccessToken();

      addLog('success', '✅ Token 刷新成功！');
      message.success('Token 刷新成功！');

      // 刷新显示
      refreshTokenInfo();
    } catch (error: any) {
      addLog('error', `❌ Token 刷新失败: ${error.message}`);
      message.error(`Token 刷新失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshTokenInfo]);

  // 清除所有 Token
  const handleClearTokens = useCallback(() => {
    TokenManager.clearTokens();
    addLog('warn', '🧹 所有 Token 已清除');
    message.success('所有 Token 已清除');
    refreshTokenInfo();
  }, [addLog, refreshTokenInfo]);

  // 复制 Token
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label} 已复制到剪贴板`);
    });
  }, []);

  // 初始化加载 Token 信息
  React.useEffect(() => {
    refreshTokenInfo();
  }, [refreshTokenInfo]);

  return (
    <PageContainer>
      <Title level={2}>🔐 Token 刷新测试</Title>
      <Paragraph type="secondary">
        测试 OAuth2 Token 刷新功能，请求地址: <Text code>http://localhost:8099/oauth2/token</Text>
      </Paragraph>

      {/* 当前状态 */}
      <StyledCard title="📊 当前 Token 状态">
        <Space size="large" style={{ marginBottom: 16 }}>
          <StatusBadge status={tokenInfo.isLoggedIn ? 'success' : 'error'}>
            {tokenInfo.isLoggedIn ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            {tokenInfo.isLoggedIn ? '已登录' : '未登录'}
          </StatusBadge>
          <StatusBadge status={tokenInfo.isExpired ? 'warning' : 'success'}>
            {tokenInfo.isExpired ? '已过期' : '有效'}
          </StatusBadge>
        </Space>

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Access Token">
            {tokenInfo.accessToken ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <TokenDisplay>{tokenInfo.accessToken}</TokenDisplay>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(tokenInfo.accessToken!, 'Access Token')}
                >
                  复制
                </Button>
              </Space>
            ) : (
              <Text type="secondary">无</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Refresh Token">
            {tokenInfo.refreshToken ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <TokenDisplay>{tokenInfo.refreshToken}</TokenDisplay>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(tokenInfo.refreshToken!, 'Refresh Token')}
                >
                  复制
                </Button>
              </Space>
            ) : (
              <Text type="secondary">无</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </StyledCard>

      {/* 操作按钮 */}
      <StyledCard title="🛠️ 操作">
        <Space wrap>
          <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={handleRefreshToken}>
            刷新 Token
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshTokenInfo}>
            刷新状态
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleClearTokens}>
            清除所有 Token
          </Button>
          <Button onClick={clearLogs}>清除日志</Button>
        </Space>

        {!tokenInfo.refreshToken && (
          <Alert
            style={{ marginTop: 16 }}
            message="提示"
            description="当前没有 Refresh Token，请先登录获取 Token 后再测试刷新功能。"
            type="warning"
            showIcon
          />
        )}
      </StyledCard>

      {/* 请求信息 */}
      <StyledCard title="📡 请求信息">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="请求地址">
            <Text code>POST /oauth2/token</Text>
          </Descriptions.Item>
          <Descriptions.Item label="代理目标">
            <Text code>http://localhost:8099/oauth2/token</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Content-Type">
            <Text code>application/x-www-form-urlencoded</Text>
          </Descriptions.Item>
          <Descriptions.Item label="请求参数">
            <Text code>grant_type=refresh_token&refresh_token=xxx&client_id=xxx</Text>
          </Descriptions.Item>
        </Descriptions>
      </StyledCard>

      {/* 日志输出 */}
      <StyledCard title="📝 操作日志">
        <LogContainer>
          {logs.length === 0 ? (
            <LogEntry type="info">暂无日志...</LogEntry>
          ) : (
            logs.map((log, index) => (
              <LogEntry key={index} type={log.type}>
                [{log.time}] {log.message}
              </LogEntry>
            ))
          )}
        </LogContainer>
      </StyledCard>
    </PageContainer>
  );
};

export default TokenTestPage;
