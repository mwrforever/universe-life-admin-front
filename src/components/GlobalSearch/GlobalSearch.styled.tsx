/**
 * 全局搜索组件样式定义
 */

import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import { Input, List } from 'antd'
import { getThemeTokens, generateCSSVariables, mediaQueries } from './GlobalSearch.tokens'

// 主容器
export const SearchContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  max-width: var(--max-width);
  z-index: var(--z-index);

  ${({ $isDark }) => generateCSSVariables(getThemeTokens($isDark))}

  ${mediaQueries.mobile} {
    max-width: none;
    --search-height: var(--mobile-height);
  }
`

// 搜索输入框
export const StyledInput = styled(Input)<{ $isDark: boolean }>`
  height: var(--search-height);
  border-radius: var(--search-radius);
  background: var(--search-bg);
  border: 1px solid var(--search-border);
  transition: all 0.2s ease;
  font-size: 14px;
  line-height: 22px;

  ${mediaQueries.mobile} {
    font-size: var(--mobile-font-size);
  }

  &:hover {
    border-color: var(--search-border-focus);
    box-shadow: 0 0 0 2px var(--search-border-focus);
  }

  &:focus,
  &.ant-input-focused {
    border-color: var(--search-border-focus);
    box-shadow: 0 0 0 2px var(--search-border-focus);
  }

  .ant-input {
    background: transparent;
    border: none;
    color: var(--search-text);
    font-size: inherit;
    line-height: inherit;

    &::placeholder {
      color: var(--search-placeholder);
    }
  }

  .ant-input-suffix {
    color: var(--desc-color);
  }
`

// 下拉容器
export const DropdownContainer = styled(motion.div)<{ $isDark: boolean; $width: number }>`
  position: absolute;
  top: calc(100% + var(--dropdown-offset));
  left: 50%;
  transform: translateX(-50%);
  width: ${({ $width }) => $width + 8}px; /* 两侧各4px视觉溢出 */
  max-width: var(--max-width);
  background: var(--dropdown-bg);
  border-radius: var(--dropdown-radius);
  box-shadow: var(--dropdown-shadow);
  border: 1px solid var(--dropdown-border);
  backdrop-filter: var(--dropdown-backdrop);
  overflow: hidden;
  z-index: var(--z-index);

  ${mediaQueries.mobile} {
    left: var(--dropdown-offset);
    right: var(--dropdown-offset);
    transform: none;
    width: auto;
    border-radius: var(--mobile-border-radius);
    max-height: 70vh;
  }

  /* 不支持backdrop-filter时的降级方案 */
  @supports not (backdrop-filter: blur(20px)) {
    background: ${({ $isDark }) => $isDark ? '#1f1f1f' : '#ffffff'};
  }
`

// 下拉内容区
export const DropdownContent = styled.div`
  max-height: var(--dropdown-max-height);
  overflow-y: auto;
  overflow-x: hidden;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: var(--scrollbar-width);
  }

  &::-webkit-scrollbar-track {
    background: var(--scrollbar-bg);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 3px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--scrollbar-thumb-hover);
    }
  }

  /* Firefox滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-bg);
`

// 建议项容器
export const SuggestionItem = styled.div<{ $isActive: boolean; $isDark: boolean }>`
  display: flex;
  align-items: center;
  padding: var(--item-padding-vertical) var(--item-padding-horizontal);
  height: var(--item-height);
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: var(--item-radius);
  position: relative;
  background: ${({ $isActive }) => $isActive ? 'var(--item-active)' : 'transparent'};

  &:hover {
    background: var(--item-hover);
  }

  /* 激活状态的左侧竖条 */
  ${({ $isActive, $isDark }) => $isActive && `
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: ${$isDark ? 'var(--antd-colorPrimary)' : 'var(--antd-colorPrimary)'};
      border-radius: 0 2px 2px 0;
    }
  `}

  ${mediaQueries.mobile} {
    padding: 16px;
    height: auto;
    min-height: 60px;
  }
`

// 建议项图标
export const SuggestionIcon = styled.span`
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`

// 建议项内容
export const SuggestionContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

// 建议项标题
export const SuggestionTitle = styled.div<{ $isDark: boolean }>`
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: var(--title-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    color: var(--highlight-color);
    font-weight: 600;
  }
`

// 建议项描述
export const SuggestionDescription = styled.div<{ $isDark: boolean }>`
  font-size: 12px;
  line-height: 20px;
  color: var(--desc-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    color: var(--highlight-color);
    font-weight: 500;
  }
`

// 历史记录分组
export const HistorySection = styled.div`
  padding: 16px 0 8px;

  &:first-child {
    padding-top: 8px;
  }
`

// 分组标题
export const SectionTitle = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: var(--history-title-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

// 清空按钮
export const ClearButton = styled.button<{ $isDark: boolean }>`
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: var(--clear-button-color);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--highlight-color);
  }

  &:active {
    transform: scale(0.95);
  }
`

// 空状态
export const EmptyState = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: var(--desc-color);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 14px;
    line-height: 22px;
  }
`

// 加载状态
export const LoadingState = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: var(--desc-color);
  font-size: 14px;
  gap: 8px;

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--desc-color);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

// 分隔线
export const Divider = styled.div<{ $isDark: boolean }>`
  height: 1px;
  background: var(--dropdown-border);
  margin: 8px 0;
`

// 动画配置
export const dropdownVariants = {
  initial: {
    opacity: 0,
    transform: 'translateY(-8px) translateX(-50%)',
  },
  animate: {
    opacity: 1,
    transform: 'translateY(0) translateX(-50%)',
  },
  exit: {
    opacity: 0,
    transform: 'translateY(-8px) translateX(-50%)',
  },
}

export const itemVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
}

// 动画列表容器
export const AnimatedList = styled(motion.div)`
  display: flex;
  flex-direction: column;
`