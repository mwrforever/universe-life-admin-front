/**
 * 搜索建议项组件
 */

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import {
  SuggestionItem,
  SuggestionIcon,
  SuggestionContent,
  SuggestionTitle,
  SuggestionDescription,
  itemVariants,
} from './GlobalSearch.styled'
import type { SearchSuggestionItemProps } from './GlobalSearch.types'
import { highlightText } from './GlobalSearch.utils'

/**
 * 搜索建议项组件
 * 显示单个搜索建议，支持高亮和交互状态
 */
export const SearchSuggestionItem: React.FC<SearchSuggestionItemProps> = memo(({
  item,
  isActive,
  keyword,
  onClick,
  onMouseEnter,
  index,
}) => {
  const handleClick = () => {
    onClick(item)
  }

  const handleMouseEnter = () => {
    onMouseEnter(index)
  }

  // 高亮标题和描述中的关键词
  const highlightedTitle = keyword
    ? highlightText(item.title, keyword)
    : [{ text: item.title, isMatch: false }]

  const highlightedDescription = keyword && item.description
    ? highlightText(item.description, keyword)
    : item.description
      ? [{ text: item.description, isMatch: false }]
      : []

  return (
    <SuggestionItem
      $isActive={isActive}
      $isDark={false} // 将从context获取
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      as={motion.div}
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.1 },
      }}
      whileTap={{
        scale: 0.99,
        transition: { duration: 0.05 },
      }}
    >
      {/* 图标 */}
      {item.icon && (
        <SuggestionIcon>
          {item.icon}
        </SuggestionIcon>
      )}

      {/* 内容区域 */}
      <SuggestionContent>
        {/* 标题 */}
        <SuggestionTitle $isDark={false}>
          {highlightedTitle.map((segment, segIndex) => (
            <span key={segIndex}>
              {segment.isMatch ? (
                <strong>{segment.text}</strong>
              ) : (
                segment.text
              )}
            </span>
          ))}
        </SuggestionTitle>

        {/* 描述 */}
        {highlightedDescription.length > 0 && (
          <SuggestionDescription $isDark={false}>
            {highlightedDescription.map((segment, segIndex) => (
              <span key={segIndex}>
                {segment.isMatch ? (
                  <strong>{segment.text}</strong>
                ) : (
                  segment.text
                )}
              </span>
            ))}
          </SuggestionDescription>
        )}
      </SuggestionContent>
    </SuggestionItem>
  )
})

SearchSuggestionItem.displayName = 'SearchSuggestionItem'

export default SearchSuggestionItem