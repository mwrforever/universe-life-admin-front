import React, { useState, useRef, useCallback } from 'react';
import { Button, Space, Grid, Badge } from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import { useTheme } from '../../context/ThemeContext';

const { useBreakpoint } = Grid;

// 节流间隔（毫秒）
const THROTTLE_DELAY = 1000;

interface SearchFilterCardProps {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  accentColor?: string;
  children: React.ReactNode;
  onSearch: () => void;
  onReset: () => void;
  onRefresh?: () => void;
  filterCount?: number;
  extra?: React.ReactNode;
}

const FilterContainer = styled.div<{ isDark: boolean; accentColor: string }>`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin: 0 0 24px 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box;
  background: ${props => props.isDark
    ? 'rgba(20, 25, 45, 0.95)'
    : 'rgba(255, 255, 255, 0.98)'};
  border: 1px solid ${props => props.isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.06)'};
  box-shadow: ${props => props.isDark
    ? '0 4px 24px rgba(0, 0, 0, 0.25)'
    : '0 2px 16px rgba(0, 0, 0, 0.06)'};
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.accentColor};
    z-index: 1;
  }

  &:hover {
    box-shadow: ${props => props.isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.35)'
      : '0 4px 24px rgba(0, 0, 0, 0.08)'};
    border-color: ${props => props.isDark
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const HeaderSection = styled.div<{ isDark: boolean }>`
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

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconWrapper = styled.div<{ accentColor: string; isDark: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.04)'};
  border: 1px solid ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  .anticon {
    font-size: 20px;
    color: ${props => props.accentColor};
  }
`;

const TitleText = styled.div<{ isDark: boolean }>`
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.88)'};
    line-height: 1.4;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const FilterContent = styled.div<{ isExpanded: boolean }>`
  padding: ${props => props.isExpanded ? '24px' : '0'};
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  opacity: ${props => props.isExpanded ? 1 : 0};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionBar = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px dashed ${props => props.isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)'};
`;

const ActionButton = styled(Button)<{ $variant?: 'primary' | 'secondary'; $isDark?: boolean }>`
  height: 36px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;

  ${props => props.$variant === 'primary' && `
    background: #1677ff;
    border: none;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);

    &:hover {
      background: #4096ff !important;
      color: #ffffff !important;
    }
  `}

  ${props => !props.$variant && `
    background: ${props.$isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.02)'};
    border: 1px solid ${props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
    color: ${props.$isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'};

    &:hover {
      border-color: #1677ff !important;
      color: #1677ff !important;
    }
  `}
`;

const ToggleButton = styled(Button)<{ $isDark: boolean }>`
  height: 32px;
  border-radius: 8px;
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

const FilterBadge = styled(Badge)`
  .ant-badge-count {
    background: #1677ff;
    box-shadow: 0 2px 6px rgba(22, 119, 255, 0.25);
  }
`;

const SearchFilterCard: React.FC<SearchFilterCardProps> = ({
  title,
  icon,
  subtitle,
  accentColor = '#1677ff',
  children,
  onSearch,
  onReset,
  onRefresh,
  filterCount = 0,
  extra,
}) => {
  const { isDarkMode } = useTheme();
  const screens = useBreakpoint();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // 节流控制
  const lastSearchTimeRef = useRef<number>(0);
  const lastRefreshTimeRef = useRef<number>(0);

  // 节流搜索
  const handleSearch = useCallback(() => {
    const now = Date.now();
    if (now - lastSearchTimeRef.current < THROTTLE_DELAY) {
      return; // 节流中，忽略点击
    }
    lastSearchTimeRef.current = now;
    setIsSearching(true);
    
    try {
      onSearch();
    } finally {
      setTimeout(() => setIsSearching(false), 500);
    }
  }, [onSearch]);

  // 节流刷新
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < THROTTLE_DELAY) {
      return; // 节流中，忽略点击
    }
    lastRefreshTimeRef.current = now;
    setIsRefreshing(true);
    
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [onRefresh]);

  return (
    <FilterContainer isDark={isDarkMode} accentColor={accentColor}>
      <HeaderSection isDark={isDarkMode}>
        <TitleGroup>
          <IconWrapper accentColor={accentColor} isDark={isDarkMode}>
            {icon}
          </IconWrapper>
          <TitleText isDark={isDarkMode}>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </TitleText>
        </TitleGroup>
        <Space size={12}>
          {onRefresh && (
            <ToggleButton
              $isDark={isDarkMode}
              onClick={handleRefresh}
              icon={<SyncOutlined spin={isRefreshing} />}
              title="刷新数据"
              disabled={isRefreshing}
            />
          )}
          {extra}
          <FilterBadge count={filterCount} size="small" offset={[-2, 2]}>
            <ToggleButton
              $isDark={isDarkMode}
              onClick={() => setIsExpanded(!isExpanded)}
              icon={<FilterOutlined />}
            >
              {screens.md && (isExpanded ? '收起筛选' : '展开筛选')}
              {isExpanded ? <UpOutlined style={{ marginLeft: 4 }} /> : <DownOutlined style={{ marginLeft: 4 }} />}
            </ToggleButton>
          </FilterBadge>
        </Space>
      </HeaderSection>

      <FilterContent isExpanded={isExpanded}>
        <FilterGrid>
          {children}
        </FilterGrid>
        <ActionBar isDark={isDarkMode}>
          <Space size={12}>
            <ActionButton
              $variant="primary"
              $isDark={isDarkMode}
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={isSearching}
              disabled={isSearching}
            >
              搜索
            </ActionButton>
            <ActionButton
              $isDark={isDarkMode}
              icon={<ReloadOutlined />}
              onClick={onReset}
            >
              重置
            </ActionButton>
          </Space>
          {filterCount > 0 && (
            <span style={{
              fontSize: 12,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)' as any,
            }}>
              已选择 {filterCount} 个筛选条件
            </span>
          )}
        </ActionBar>
      </FilterContent>
    </FilterContainer>
  );
};

export default SearchFilterCard;
