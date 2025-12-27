import React from 'react';
import { Table, Button, Space, Tooltip } from 'antd';
import type { TableProps } from 'antd';
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

interface DataTableProps<T> extends Omit<TableProps<T>, 'title'> {
  title?: string;
  onAdd?: () => void;
  addButtonText?: string;
  onExport?: () => void;
  onImport?: () => void;
  extra?: React.ReactNode;
}

const TableContainer = styled.div<{ isDark: boolean }>`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin: 0;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  flex: 1;
  background: ${props => props.isDark
    ? 'rgba(20, 25, 45, 0.95)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${props => props.isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.3)'
    : '0 8px 32px rgba(31, 38, 135, 0.1)'};

  .ant-table {
    background: transparent;
    width: 100%;
    table-layout: fixed;
  }
  
  .ant-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  
  .ant-table-container {
    width: 100%;
  }

  .ant-table-thead > tr > th {
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.02)'} !important;
    border-bottom: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(0, 0, 0, 0.06)'} !important;
    color: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.85)'
      : 'rgba(0, 0, 0, 0.88)'};
    font-weight: 600;
    padding: 16px;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.04)'
      : 'rgba(0, 0, 0, 0.04)'} !important;
    padding: 16px;
    transition: background 0.3s ease;
  }

  .ant-table-tbody > tr:hover > td {
    background: ${props => props.isDark
      ? 'rgba(91, 80, 255, 0.06)'
      : 'rgba(91, 80, 255, 0.04)'} !important;
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: none !important;
  }

  .ant-pagination {
    padding: 16px 24px;
    margin: 0 !important;
    background: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.02)'
      : 'rgba(0, 0, 0, 0.01)'};
    border-top: 1px solid ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const TableHeader = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  background: ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.01)'};
`;

const TableTitle = styled.h3<{ isDark: boolean }>`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.88)'};
`;

const AddButton = styled(Button)`
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  background: #1677ff;
  border: none;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #4096ff !important;
    color: #ffffff !important;
  }
`;

const ActionButton = styled(Button)<{ $isDark: boolean }>`
  height: 32px;
  border-radius: 6px;
  background: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.06)'};
  color: ${props => props.$isDark
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(0, 0, 0, 0.65)'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isDark
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.04)'};
    border-color: #1677ff !important;
    color: #1677ff !important;
  }
`;

function DataTable<T extends object>({
  title,
  onAdd,
  addButtonText = '新增',
  onExport,
  onImport,
  extra,
  ...tableProps
}: DataTableProps<T>) {
  const { isDarkMode } = useTheme();

  return (
    <TableContainer isDark={isDarkMode}>
      {(title || onAdd || onExport || onImport || extra) && (
        <TableHeader isDark={isDarkMode}>
          <TableTitle isDark={isDarkMode}>{title || '数据列表'}</TableTitle>
          <Space size={12}>
            {extra}
            {onImport && (
              <Tooltip title="导入">
                <ActionButton $isDark={isDarkMode} icon={<UploadOutlined />} onClick={onImport}>
                  导入
                </ActionButton>
              </Tooltip>
            )}
            {onExport && (
              <Tooltip title="导出">
                <ActionButton $isDark={isDarkMode} icon={<DownloadOutlined />} onClick={onExport}>
                  导出
                </ActionButton>
              </Tooltip>
            )}
            {onAdd && (
              <AddButton icon={<PlusOutlined />} onClick={onAdd}>
                {addButtonText}
              </AddButton>
            )}
          </Space>
        </TableHeader>
      )}
      <Table<T> {...tableProps} />
    </TableContainer>
  );
}

export default DataTable;
