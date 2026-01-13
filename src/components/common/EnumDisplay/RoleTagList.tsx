/**
 * 角色标签列表组件
 * 展示多个角色标签，支持溢出处理
 */
import React from 'react';
import { Space, Tooltip } from 'antd';
import { useTheme } from '../../../context/ThemeContext';
import type { RoleTagListProps } from './types';

export const RoleTagList: React.FC<RoleTagListProps> = ({
  roles,
  maxDisplay = 3,
  className,
}) => {
  const { isDarkMode } = useTheme();

  if (!roles || roles.length === 0) {
    return <span style={{ color: '#8c8c8c' }}>-</span>;
  }

  const displayRoles = roles.slice(0, maxDisplay);
  const remainingRoles = roles.slice(maxDisplay);
  const remainingCount = remainingRoles.length;

  const tagStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 7px',
    borderRadius: '4px',
    fontSize: '12px',
    lineHeight: '20px',
    backgroundColor: isDarkMode ? '#111a2c' : '#e6f4ff',
    color: isDarkMode ? '#69b1ff' : '#1677ff',
    border: `1px solid ${isDarkMode ? '#15325b' : '#91caff'}`,
  };

  const moreTagStyle: React.CSSProperties = {
    ...tagStyle,
    backgroundColor: isDarkMode ? '#1f1f1f' : '#f5f5f5',
    color: isDarkMode ? '#8c8c8c' : '#595959',
    border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
    cursor: 'pointer',
  };

  return (
    <Space size={4} wrap className={className}>
      {displayRoles.map((role, index) => (
        <span key={index} style={tagStyle}>{role}</span>
      ))}
      {remainingCount > 0 && (
        <Tooltip title={remainingRoles.join('、')}>
          <span style={moreTagStyle}>+{remainingCount}</span>
        </Tooltip>
      )}
    </Space>
  );
};

export default RoleTagList;
