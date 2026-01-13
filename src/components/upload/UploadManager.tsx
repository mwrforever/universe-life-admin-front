/**
 * 上传管理器组件
 * 提供拖拽上传、批量操作、上传统计等功能
 */

import React, { useCallback } from 'react';
import { Upload, Button, Space, Typography, message } from 'antd';
import {
  InboxOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useCOSUpload } from '@/hooks/useCOSUpload';
import { FileItem } from './FileItem';
import type { UploadManagerProps, UploadTask } from '@/types/upload';
import type { RcFile } from 'antd/es/upload/interface';

const { Dragger } = Upload;
const { Text } = Typography;

export const UploadManager: React.FC<UploadManagerProps> = ({
  bucket,
  region,
  accept,
  maxSize,
  maxCount,
  onComplete,
  onError,
}) => {
  const {
    tasks,
    addFiles,
    pause,
    resume,
    cancel,
    retry,
    pauseAll,
    resumeAll,
    cancelAll,
    isOnline,
  } = useCOSUpload({
    bucket,
    region,
    onComplete: (task: UploadTask) => {
      if (task.fileId && task.downloadPath) {
        onComplete?.(task.fileId, task.downloadPath);
      }
    },
    onError: (_task: UploadTask, error: Error) => onError?.(error),
  });

  const handleBeforeUpload = useCallback(
    (file: RcFile, fileList: RcFile[]): boolean => {
      // 检查文件大小
      if (maxSize && file.size > maxSize) {
        message.error(`文件 ${file.name} 超过最大限制 ${Math.round(maxSize / 1024 / 1024)}MB`);
        return false;
      }

      // 检查文件数量
      if (maxCount && tasks.length + fileList.length > maxCount) {
        message.error(`最多只能上传 ${maxCount} 个文件`);
        return false;
      }

      // 只在第一个文件时添加所有有效文件
      if (file === fileList[0]) {
        const validFiles = fileList.filter(f => !(maxSize && f.size > maxSize));
        if (validFiles.length > 0) {
          addFiles(validFiles);
        }
      }

      return false; // 阻止默认上传行为
    },
    [addFiles, maxSize, maxCount, tasks.length]
  );

  // 统计信息
  const stats = {
    total: tasks.length,
    uploading: tasks.filter(t =>
      ['pending', 'hashing', 'checking', 'uploading'].includes(t.status)
    ).length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    paused: tasks.filter(t => t.status === 'paused').length,
  };

  return (
    <div className="upload-manager">
      {/* 网络离线提示 */}
      {!isOnline && (
        <div
          style={{
            padding: '8px 16px',
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4,
            marginBottom: 16,
          }}
        >
          <Text type="warning">⚠️ 网络已断开，上传已暂停。</Text>
        </div>
      )}

      {/* 拖拽上传区域 */}
      <Dragger
        multiple
        accept={accept}
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        disabled={!isOnline}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持单个或批量上传，大文件自动分片断点续传</p>
      </Dragger>

      {/* 批量操作和统计 */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              icon={<PauseCircleOutlined />}
              onClick={pauseAll}
              disabled={stats.uploading === 0}
            >
              全部暂停
            </Button>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={resumeAll}
              disabled={stats.paused === 0}
            >
              全部继续
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => {
                if (window.confirm('确定要取消所有上传吗？')) {
                  cancelAll();
                }
              }}
            >
              全部取消
            </Button>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              共 {stats.total} 个文件：
              {stats.uploading > 0 && (
                <span style={{ color: '#1890ff' }}> {stats.uploading} 上传中</span>
              )}
              {stats.completed > 0 && (
                <span style={{ color: '#52c41a' }}> {stats.completed} 已完成</span>
              )}
              {stats.failed > 0 && (
                <span style={{ color: '#ff4d4f' }}> {stats.failed} 失败</span>
              )}
              {stats.paused > 0 && (
                <span style={{ color: '#faad14' }}> {stats.paused} 已暂停</span>
              )}
            </Text>
          </div>
        </div>
      )}

      {/* 文件列表 */}
      <div className="file-list">
        {tasks.map(task => (
          <FileItem
            key={task.id}
            task={task}
            onPause={() => pause(task.id)}
            onResume={() => resume(task.id)}
            onCancel={() => cancel(task.id)}
            onRetry={() => retry(task.id)}
          />
        ))}
      </div>

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#999' }}>
          <Text type="secondary">暂无上传任务</Text>
        </div>
      )}
    </div>
  );
};
