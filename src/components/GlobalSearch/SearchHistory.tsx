/**
 * 搜索历史记录组件
 */

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HistorySection,
  SectionTitle,
  ClearButton,
  EmptyState,
  Divider,
  AnimatedList,
} from './GlobalSearch.styled'
import SearchSuggestionItem from './SearchSuggestionItem'
import type { SearchHistoryProps } from './GlobalSearch.types'

/**
 * 搜索历史记录组件
 * 显示用户的搜索历史，支持清空和选择
 */
export const SearchHistory: React.FC<SearchHistoryProps> = memo(({
  items,
  onClear,
  onSelect,
  onMouseEnter,
  activeIndex,
  startIndex,
}) => {
  // 处理清空历史记录
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear()
  }

  // 如果没有历史记录，显示空状态
  if (items.length === 0) {
    return (
      <HistorySection>
        <EmptyState $isDark={false}>
          <div className="empty-icon">🔍</div>
          <div className="empty-text">暂无搜索记录</div>
        </EmptyState>
      </HistorySection>
    )
  }

  return (
    <HistorySection>
      {/* 分组标题和清空按钮 */}
      <SectionTitle $isDark={false}>
        <span>最近搜索</span>
        <ClearButton $isDark={false} onClick={handleClear}>
          清空
        </ClearButton>
      </SectionTitle>

      {/* 历史记录列表 */}
      <AnimatedList>
        <AnimatePresence mode="wait">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
                delay: index * 0.05, // 错开动画时间
              }}
            >
              <SearchSuggestionItem
                item={item}
                isActive={activeIndex === startIndex + index}
                keyword="" // 历史记录不高亮关键词
                onClick={onSelect}
                onMouseEnter={onMouseEnter}
                index={startIndex + index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </AnimatedList>

      {/* 分隔线 */}
      <Divider $isDark={false} />
    </HistorySection>
  )
})

SearchHistory.displayName = 'SearchHistory'

export default SearchHistory