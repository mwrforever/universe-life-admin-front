/**
 * 简化的全局搜索组件
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import { useTheme } from '@/contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'

// 模拟搜索数据
const mockSuggestions = [
  {
    id: '1',
    title: '用户管理',
    description: '管理系统用户信息',
    url: '/users',
    timestamp: Date.now(),
  },
  {
    id: '2',
    title: '任务管理',
    description: '创建和分配任务',
    url: '/tasks',
    timestamp: Date.now(),
  },
  {
    id: '3',
    title: '支付管理',
    description: '管理支付流程',
    url: '/payments',
    timestamp: Date.now(),
  },
]

interface SimpleSearchProps {
  placeholder?: string
  maxHistoryItems?: number
  onSearch?: (keyword: string) => void
  onSelect?: (item: any) => void
  className?: string
  style?: React.CSSProperties
}

const SimpleGlobalSearch: React.FC<SimpleSearchProps> = ({
  placeholder = '搜索用户、订单、任务...',
  maxHistoryItems = 10,
  onSearch,
  onSelect,
  className,
  style,
}) => {
  const { themeMode } = useTheme()
  const isDark = themeMode === 'dark'
  const navigate = useNavigate()

  // 状态管理
  const [keyword, setKeyword] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // 历史记录
  const [history, setHistory] = useState<any[]>([])

  // 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem('search-history')
      if (stored) {
        const items = JSON.parse(stored)
        setHistory(items.slice(0, maxHistoryItems))
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
    }
  }, [maxHistoryItems])

  // 防抖搜索
  const debouncedSearch = useCallback((searchKeyword: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      if (!searchKeyword.trim()) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 200))

        const filtered = mockSuggestions.filter(item =>
          item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchKeyword.toLowerCase())
        )

        setSuggestions(filtered)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 200)
  }, [])

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    setActiveIndex(-1)
    debouncedSearch(value)
  }, [debouncedSearch])

  // 处理聚焦
  const handleFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  // 处理失焦
  const handleBlur = useCallback(() => {
    // 延迟关闭，给用户时间点击历史记录
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }, [])

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = keyword.trim() ? suggestions : history
    const { key } = e

    switch (key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev =>
          prev < items.length - 1 ? prev + 1 : (items.length > 0 ? 0 : -1)
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : (items.length - 1 >= 0 ? items.length - 1 : -1)
        )
        break

      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < items.length) {
          handleSelect(items[activeIndex])
        } else if (keyword.trim()) {
          handleDefaultSearch(keyword)
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setKeyword('')
        setActiveIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [keyword, suggestions, history, activeIndex])

  // 处理项目选择
  const handleSelect = useCallback((item: any) => {
    // 添加到历史记录
    const newHistory = [
      { ...item, timestamp: Date.now() },
      ...history.filter(h => h.url !== item.url),
    ].slice(0, maxHistoryItems)

    setHistory(newHistory)
    try {
      localStorage.setItem('search-history', JSON.stringify(newHistory))
    } catch (error) {
      console.warn('Failed to save search history:', error)
    }

    // 调用回调
    if (onSelect) {
      onSelect(item)
    } else {
      navigate(item.url)
    }

    // 重置状态
    setKeyword('')
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
  }, [history, maxHistoryItems, onSelect, navigate])

  // 处理默认搜索
  const handleDefaultSearch = useCallback((searchKeyword: string) => {
    console.log('Default search:', searchKeyword)
    if (onSearch) {
      onSearch(searchKeyword)
    }
  }, [onSearch])

  // 处理清空历史
  const handleClearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem('search-history')
    } catch (error) {
      console.warn('Failed to clear search history:', error)
    }
  }, [])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 添加CSS样式
  useEffect(() => {
    const styleId = 'global-search-styles'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement

    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = `
        .global-search-input:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,.08) !important;
          transform: translateY(-1px);
        }

        .global-search-input:focus,
        .global-search-input.ant-input-focused {
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15) !important;
          border-color: #1890ff !important;
          transform: none;
        }

        .global-search-input::placeholder {
          color: #a6a6a6;
        }

        /* 暗黑模式适配 */
        [data-theme='dark'] .global-search-input {
          background: #262626 !important;
          color: #ffffff !important;
        }

        [data-theme='dark'] .global-search-input:focus,
        [data-theme='dark'] .global-search-input.ant-input-focused {
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.25) !important;
          border-color: #1890ff !important;
        }
      `
      document.head.appendChild(styleEl)
    }

    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl)
      }
    }
  }, [isDark])

  // 显示的项目
  const displayItems = useMemo(() => {
    return keyword.trim() ? suggestions : history
  }, [keyword, suggestions, history])

  // 样式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    ...style,
  }

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: isDark ? '#1f1f1f' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '12px',
    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
    zIndex: 1050,
    maxHeight: '360px',
    overflow: 'auto',
  }

  const itemStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const activeItemStyle: React.CSSProperties = {
    ...itemStyle,
    backgroundColor: isDark ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.06)',
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={keyword}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        prefix={<SearchOutlined style={{ color: keyword ? '#096dd9' : '#bfbfbf' }} />}
        className="global-search-input"
        style={{
          height: '40px',
          borderRadius: '8px',
          background: isDark ? '#262626' : '#f5f7fa',
          border: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          color: isDark ? '#ffffff' : '#262626',
        }}
      />

      {/* 下拉框 */}
      {isOpen && (
        <div style={dropdownStyle}>
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: isDark ? '#a6a6a6' : '#666' }}>
              搜索中...
            </div>
          )}

          {!loading && displayItems.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: isDark ? '#a6a6a6' : '#666' }}>
              {keyword.trim() ? '未找到相关结果' : '暂无搜索记录'}
            </div>
          )}

          {!loading && displayItems.length > 0 && (
            <div>
              {/* 历史记录标题 */}
              {!keyword.trim() && history.length > 0 && (
                <div style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  color: isDark ? '#a6a6a6' : '#666',
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>最近搜索</span>
                  <button
                    onClick={handleClearHistory}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#a6a6a6' : '#666',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    清空
                  </button>
                </div>
              )}

              {/* 项目列表 */}
              {displayItems.map((item, index) => (
                <div
                  key={item.id}
                  style={index === activeIndex ? activeItemStyle : itemStyle}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div style={{ fontSize: '20px' }}>
                    {item.icon || '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#ffffff' : '#000000' }}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : '#666', marginTop: '2px' }}>
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SimpleGlobalSearch