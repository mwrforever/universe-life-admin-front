/**
 * 下载链接组件
 * 获取签名下载 URL 并触发浏览器下载
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { COSUploadApiService } from '@/services/upload/uploadApi';
import type { DownloadLinkProps } from '@/types/upload';

/**
 * 格式化剩余时间
 */
function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '已过期';
  if (ms < 60000) return `${Math.ceil(ms / 1000)}秒`;
  if (ms < 3600000) return `${Math.ceil(ms / 60000)}分钟`;
  return `${Math.ceil(ms / 3600000)}小时`;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({
  fileId,
  filename,
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [expireAt, setExpireAt] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 更新剩余时间
  useEffect(() => {
    if (expireAt) {
      const updateRemaining = () => {
        const remaining = expireAt - Date.now();
        setRemainingTime(remaining > 0 ? remaining : 0);
        
        if (remaining <= 0) {
          setDownloadUrl(null);
          setExpireAt(null);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      };

      updateRemaining();
      timerRef.current = setInterval(updateRemaining, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [expireAt]);

  /**
   * 获取下载 URL
   * 注意：组件 prop 名为 fileId，但 API 参数名为 fileUrl（文件路径）
   */
  const fetchDownloadUrl = useCallback(async () => {
    setLoading(true);
    try {
      // fileId 实际上是文件路径（downloadPath），API 参数名为 fileUrl
      const response = await COSUploadApiService.getDownloadToken({ fileUrl: fileId });
      const { expiredUrl, expireAt: newExpireAt } = response.data!;
      setDownloadUrl(expiredUrl);
      setExpireAt(newExpireAt);
      return expiredUrl;
    } catch (error) {
      message.error('获取下载链接失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  /**
   * 处理下载
   */
  const handleDownload = useCallback(async () => {
    let url = downloadUrl;

    // 如果没有 URL 或已过期，重新获取
    if (!url || (expireAt && expireAt <= Date.now())) {
      url = await fetchDownloadUrl();
    }

    if (url) {
      // 创建临时链接并触发下载
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || '';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadUrl, expireAt, fetchDownloadUrl, filename]);

  const tooltipTitle =
    remainingTime !== null && remainingTime > 0
      ? `链接有效期: ${formatRemainingTime(remainingTime)}`
      : '点击获取下载链接';

  // 自定义子元素
  if (children) {
    return (
      <Tooltip title={tooltipTitle}>
        <span onClick={handleDownload} style={{ cursor: 'pointer' }}>
          {loading ? <LoadingOutlined /> : children}
        </span>
      </Tooltip>
    );
  }

  // 默认按钮
  return (
    <Tooltip title={tooltipTitle}>
      <Button
        type="link"
        icon={loading ? <LoadingOutlined /> : <DownloadOutlined />}
        onClick={handleDownload}
        disabled={loading}
      >
        下载
        {remainingTime !== null && remainingTime > 0 && (
          <span style={{ fontSize: 12, marginLeft: 4, color: '#999' }}>
            ({formatRemainingTime(remainingTime)})
          </span>
        )}
      </Button>
    </Tooltip>
  );
};
