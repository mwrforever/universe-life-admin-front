import React, { useState, useEffect } from 'react';
import { Upload, message, Avatar, Spin } from 'antd';
import type { UploadProps } from 'antd';
import { PlusOutlined, UserOutlined, CameraOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  size?: number;
  disabled?: boolean;
}

const UploadWrapper = styled.div<{ $size: number; $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .avatar-uploader {
    .ant-upload {
      width: ${props => props.$size}px;
      height: ${props => props.$size}px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      border: 2px dashed ${props => props.$isDark
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.15)'};
      background: ${props => props.$isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.02)'};
      transition: all 0.3s ease;

      &:hover {
        border-color: #1677ff;
      }
    }
  }
`;

const AvatarContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  border-radius: 50%;
  overflow: hidden;

  .avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;

    .anticon {
      font-size: 24px;
      color: #fff;
    }
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }
`;

const UploadPlaceholder = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .anticon {
    font-size: 20px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }

  .text {
    font-size: 11px;
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const HelpText = styled.div<{ $isDark: boolean }>`
  font-size: 11px;
  color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'};
  text-align: center;
  line-height: 1.4;
`;

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  size = 100,
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);

  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB！');
      return false;
    }

    return true;
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      const file = info.file.originFileObj;
      if (file) {
        try {
          const base64 = await getBase64(file);
          setImageUrl(base64);
          setLoading(false);
          onChange?.(base64);
          message.success('头像上传成功！');
        } catch {
          setLoading(false);
          message.error('上传失败！');
        }
      }
    }

    if (info.file.status === 'error') {
      setLoading(false);
      message.error('上传失败！');
    }
  };

  const customRequest: UploadProps['customRequest'] = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess?.('ok');
    }, 300);
  };

  const uploadContent = imageUrl ? (
    <AvatarContainer $size={size}>
      <Avatar src={imageUrl} size={size} icon={<UserOutlined />} />
      {!disabled && (
        <div className="avatar-overlay">
          <CameraOutlined />
        </div>
      )}
    </AvatarContainer>
  ) : (
    <UploadPlaceholder $isDark={isDarkMode}>
      {loading ? <Spin size="small" /> : <PlusOutlined />}
      <span className="text">上传头像</span>
    </UploadPlaceholder>
  );

  return (
    <UploadWrapper $size={size} $isDark={isDarkMode}>
      <Upload
        name="avatar"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={customRequest}
        disabled={disabled || loading}
        accept="image/*"
        className="avatar-uploader"
      >
        {uploadContent}
      </Upload>
      <HelpText $isDark={isDarkMode}>
        支持 JPG、PNG，不超过 2MB
      </HelpText>
    </UploadWrapper>
  );
};

export default AvatarUpload;
