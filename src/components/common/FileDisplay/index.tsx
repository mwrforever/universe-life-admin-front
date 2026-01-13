/**
 * 文件展示组件
 * 支持图片预览和文件下载
 */

import React, { useState, useMemo } from 'react';
import { Card, Modal, Tooltip } from 'antd';
import {
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { ThumbnailImage } from '../ThumbnailImage';
import { DownloadLink } from '@/components/upload/DownloadLink';
import { isImageFile, isImageByExtension } from '@/utils/thumbnail';
import { formatBytes } from '@/utils/formatBytes';
import type { ThumbnailSize } from '@/utils/thumbnail';

export interface FileDisplayProps {
  /** 文件 ID */
  fileId: string;
  /** 文件名 */
  filename: string;
  /** 文件 URL（用于预览） */
  url?: string;
  /** 文件类型 */
  mimeType?: string;
  /** 文件大小 */
  size?: number;
  /** 显示模式 */
  mode?: 'thumbnail' | 'list' | 'card';
  /** 是否可预览 */
  previewable?: boolean;
  /** 是否可下载 */
  downloadable?: boolean;
  /** 缩略图尺寸 */
  thumbnailSize?: ThumbnailSize;
  /** 自定义宽度 */
  width?: number;
  /** 自定义高度 */
  height?: number;
}

// 文件图标映射
const FILE_ICONS: Record<string, React.ReactNode> = {
  'file-pdf': <FilePdfOutlined />,
  'file-word': <FileWordOutlined />,
  'file-excel': <FileExcelOutlined />,
  'file-ppt': <FilePptOutlined />,
  'file-zip': <FileZipOutlined />,
  'file-text': <FileTextOutlined />,
  'file-image': <FileImageOutlined />,
  'file-video': <PlayCircleOutlined />,
  'file-audio': <SoundOutlined />,
  'file': <FileOutlined />,
};

// 根据 MIME 类型获取图标名称
function getIconName(mimeType?: string, filename?: string): string {
  if (mimeType) {
    if (isImageFile(mimeType)) return 'file-image';
    if (mimeType.includes('pdf')) return 'file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-ppt';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'file-zip';
    if (mimeType.includes('text')) return 'file-text';
    if (mimeType.includes('video')) return 'file-video';
    if (mimeType.includes('audio')) return 'file-audio';
  }
  
  if (filename) {
    if (isImageByExtension(filename)) return 'file-image';
    const ext = filename.split('.').pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      pdf: 'file-pdf',
      doc: 'file-word',
      docx: 'file-word',
      xls: 'file-excel',
      xlsx: 'file-excel',
      ppt: 'file-ppt',
      pptx: 'file-ppt',
      zip: 'file-zip',
      rar: 'file-zip',
      '7z': 'file-zip',
      txt: 'file-text',
      mp4: 'file-video',
      avi: 'file-video',
      mov: 'file-video',
      mp3: 'file-audio',
      wav: 'file-audio',
    };
    if (ext && extMap[ext]) return extMap[ext];
  }
  
  return 'file';
}

// 判断是否为图片
function isImage(mimeType?: string, filename?: string): boolean {
  if (mimeType && isImageFile(mimeType)) return true;
  if (filename && isImageByExtension(filename)) return true;
  return false;
}

// Styled Components
const ThumbnailContainer = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;

  &:hover .overlay {
    opacity: 1;
  }
`;

const IconContainer = styled.div<{ $width: number; $height: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #8c8c8c;

  .icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .filename {
    font-size: 12px;
    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;

  .action-btn {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ListContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f0f0f0;
  }

  .icon {
    font-size: 24px;
    color: #8c8c8c;
  }

  .info {
    flex: 1;
    min-width: 0;

    .filename {
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .size {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .actions {
    display: flex;
    gap: 8px;

    .action-btn {
      color: #8c8c8c;
      cursor: pointer;
      padding: 4px;
      transition: color 0.3s ease;

      &:hover {
        color: #1677ff;
      }
    }
  }
`;

const CardContainer = styled(Card)`
  width: 100%;
  
  .ant-card-body {
    padding: 12px;
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .preview {
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;

    .filename {
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }
`;

/**
 * 文件展示组件
 */
export const FileDisplay: React.FC<FileDisplayProps> = ({
  fileId,
  filename,
  url,
  mimeType,
  size,
  mode = 'thumbnail',
  previewable = true,
  downloadable = true,
  thumbnailSize = 'medium',
  width = 120,
  height = 120,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const isImageType = useMemo(
    () => isImage(mimeType, filename),
    [mimeType, filename]
  );

  const iconName = useMemo(
    () => getIconName(mimeType, filename),
    [mimeType, filename]
  );

  const icon = FILE_ICONS[iconName] || FILE_ICONS['file'];

  const handlePreview = () => {
    if (previewable && isImageType && url) {
      setPreviewVisible(true);
    }
  };

  // 缩略图模式
  if (mode === 'thumbnail') {
    return (
      <>
        <ThumbnailContainer $width={width} $height={height}>
          {isImageType && url ? (
            <>
              <ThumbnailImage
                src={url}
                width={width}
                height={height}
                thumbnailSize={thumbnailSize}
                onClick={handlePreview}
              />
              <ThumbnailOverlay className="overlay">
                {previewable && (
                  <EyeOutlined className="action-btn" onClick={handlePreview} />
                )}
                {downloadable && (
                  <DownloadLink fileId={fileId} filename={filename}>
                    <DownloadOutlined className="action-btn" />
                  </DownloadLink>
                )}
              </ThumbnailOverlay>
            </>
          ) : (
            <IconContainer $width={width} $height={height}>
              <span className="icon">{icon}</span>
              <Tooltip title={filename}>
                <span className="filename">{filename}</span>
              </Tooltip>
            </IconContainer>
          )}
        </ThumbnailContainer>

        {/* 图片预览 Modal */}
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="80%"
          centered
        >
          {url && <img src={url} alt={filename} style={{ width: '100%' }} />}
        </Modal>
      </>
    );
  }

  // 列表模式
  if (mode === 'list') {
    return (
      <ListContainer onClick={handlePreview}>
        {isImageType && url ? (
          <ThumbnailImage
            src={url}
            width={40}
            height={40}
            thumbnailSize="small"
          />
        ) : (
          <span className="icon">{icon}</span>
        )}
        <div className="info">
          <Tooltip title={filename}>
            <div className="filename">{filename}</div>
          </Tooltip>
          {size !== undefined && (
            <div className="size">{formatBytes(size)}</div>
          )}
        </div>
        <div className="actions">
          {previewable && isImageType && (
            <EyeOutlined className="action-btn" onClick={handlePreview} />
          )}
          {downloadable && (
            <DownloadLink fileId={fileId} filename={filename}>
              <DownloadOutlined className="action-btn" />
            </DownloadLink>
          )}
        </div>
      </ListContainer>
    );
  }

  // 卡片模式
  return (
    <CardContainer>
      <div className="card-content">
        <div className="preview">
          {isImageType && url ? (
            <ThumbnailImage
              src={url}
              width={64}
              height={64}
              thumbnailSize="small"
              onClick={handlePreview}
            />
          ) : (
            <IconContainer $width={64} $height={64}>
              <span className="icon">{icon}</span>
            </IconContainer>
          )}
        </div>
        <div className="info">
          <Tooltip title={filename}>
            <div className="filename">{filename}</div>
          </Tooltip>
          <div className="meta">
            {size !== undefined && formatBytes(size)}
            {mimeType && ` · ${mimeType.split('/')[1]?.toUpperCase()}`}
          </div>
        </div>
        <div className="actions">
          {previewable && isImageType && (
            <EyeOutlined
              style={{ fontSize: 18, cursor: 'pointer', color: '#8c8c8c' }}
              onClick={handlePreview}
            />
          )}
          {downloadable && (
            <DownloadLink fileId={fileId} filename={filename}>
              <DownloadOutlined style={{ fontSize: 18, color: '#8c8c8c' }} />
            </DownloadLink>
          )}
        </div>
      </div>

      {/* 图片预览 Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        centered
      >
        {url && <img src={url} alt={filename} style={{ width: '100%' }} />}
      </Modal>
    </CardContainer>
  );
};

export default FileDisplay;
