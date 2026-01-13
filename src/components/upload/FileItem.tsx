/**
 * 文件项组件
 * 显示单个上传任务的状态和操作按钮
 */

import React, { useMemo } from 'react';
import { Card, Progress, Button, Space, Typography, Tag, Tooltip } from 'antd';
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { formatBytes } from '@/utils/formatBytes';
import type { FileItemProps, UploadStatus } from '@/types/upload';

const { Text } = Typography;

/** 状态配置 */
const STATUS_CONFIG: Record<UploadStatus, { color: string; text: string; icon: React.ReactNode }> = {
  pending: { color: 'default', text: '等待中', icon: <ClockCircleOutlined /> },
  hashing: { color: 'processing', text: '计算哈希', icon: <LoadingOutlined /> },
  checking: { color: 'processing', text: '秒传检查', icon: <LoadingOutlined /> },
  uploading: { color: 'processing', text: '上传中', icon: <LoadingOutlined /> },
  paused: { color: 'warning', text: '已暂停', icon: <PauseCircleOutlined /> },
  completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
  failed: { color: 'error', text: '失败', icon: <ExclamationCircleOutlined /> },
};

export const FileItem: React.FC<FileItemProps> = ({
  task,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  const { file, status, progress, error } = task;
  const statusConfig = STATUS_CONFIG[status];

  // 按钮可见性
  const canPause = ['uploading', 'hashing', 'checking'].includes(status);
  const canResume = status === 'paused';
  const canRetry = status === 'failed';
  const canCancel = status !== 'completed';

  // 进度条状态
  const progressStatus = useMemo(() => {
    if (status === 'failed') return 'exception';
    if (status === 'completed') return 'success';
    if (['uploading', 'hashing', 'checking'].includes(status)) return 'active';
    return 'normal';
  }, [status]);

  return (
    <Card
      size="small"
      style={{ marginBottom: 8 }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: 24, color: '#1890ff' }}>
          <FileOutlined />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Tooltip title={file.name}>
              <Text strong ellipsis style={{ maxWidth: 200 }}>
                {file.name}
              </Text>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatBytes(file.size)}
            </Text>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.text}
            </Tag>
          </div>
          <Progress
            percent={progress}
            size="small"
            status={progressStatus}
            showInfo={status !== 'completed'}
            style={{ marginBottom: 4 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {error && (
                <Tooltip title={error}>
                  <Text type="danger" style={{ fontSize: 12 }}>
                    {error.length > 30 ? `${error.slice(0, 30)}...` : error}
                  </Text>
                </Tooltip>
              )}
            </div>
            <Space size="small">
              {canPause && (
                <Tooltip title="暂停">
                  <Button
                    type="text"
                    size="small"
                    icon={<PauseCircleOutlined />}
                    onClick={onPause}
                  />
                </Tooltip>
              )}
              {canResume && (
                <Tooltip title="继续">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={onResume}
                  />
                </Tooltip>
              )}
              {canRetry && (
                <Tooltip title="重试">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                  />
                </Tooltip>
              )}
              {canCancel && (
                <Tooltip title="取消">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={onCancel}
                  />
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      </div>
    </Card>
  );
};
