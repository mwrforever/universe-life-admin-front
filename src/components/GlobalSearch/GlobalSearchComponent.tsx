/**
 * 全局搜索组件 - 下拉框形式
 * 聚焦时在输入框下方显示搜索建议下拉框
 * 包含本系统相关内容和功能
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from 'antd'
import type { InputRef } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { debounce } from 'lodash-es'
import './GlobalSearchComponent.css'

// 搜索建议项接口
interface SearchSuggestion {
  id: string
  title: string
  description?: string
  path: string
  category?: string
  icon?: string
  breadcrumb?: string
}

// API 响应接口标准
interface SearchResponse {
  success: boolean
  data: {
    suggestions: SearchSuggestion[]
    total: number
  }
  message?: string
}

// 本系统相关的搜索建议内容
const getSystemSuggestions = (): SearchSuggestion[] => [
  {
    id: '1',
    title: '用户管理',
    description: '管理系统用户信息，包括用户列表、权限配置、账户状态等',
    path: '/users',
    category: '系统管理',
    breadcrumb: '系统管理 > 用户管理',
    icon: '👥'
  },
  {
    id: '2',
    title: '订单管理',
    description: '处理订单查询、状态更新、退款申请等订单相关操作',
    path: '/orders',
    category: '订单管理',
    breadcrumb: '订单管理 > 订单列表',
    icon: '📋'
  },
  {
    id: '3',
    title: '任务分配',
    description: '创建和分配任务，跟踪任务进度，管理任务优先级',
    path: '/tasks',
    category: '任务管理',
    breadcrumb: '任务管理 > 任务分配',
    icon: '✅'
  },
  {
    id: '4',
    title: '支付管理',
    description: '管理支付流程，包括支付方式配置、交易记录、退款处理等',
    path: '/payments',
    category: '支付系统',
    breadcrumb: '支付管理 > 支付配置',
    icon: '💳'
  },
  {
    id: '5',
    title: '聊天记录',
    description: '查看和管理用户聊天记录，处理聊天相关的客服工作',
    path: '/chat',
    category: '客服管理',
    breadcrumb: '客服管理 > 聊天记录',
    icon: '💬'
  },
  {
    id: '6',
    title: '数据报表',
    description: '生成各类数据报表，包括用户统计、支付分析、任务完成情况等',
    path: '/reports',
    category: '数据分析',
    breadcrumb: '数据分析 > 数据报表',
    icon: '📊'
  },
  {
    id: '7',
    title: '系统设置',
    description: '配置系统参数，管理全局设置，维护系统运行环境',
    path: '/settings',
    category: '系统管理',
    breadcrumb: '系统管理 > 系统设置',
    icon: '⚙️'
  },
  {
    id: '8',
    title: '仪表板',
    description: '查看系统概览数据和关键指标监控',
    path: '/dashboard',
    category: '数据监控',
    breadcrumb: '数据监控 > 仪表板',
    icon: '📈'
  }
]

// 模拟搜索API
const mockSearchAPI = async (query: string): Promise<SearchResponse> => {
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!query.trim()) {
    return {
      success: true,
      data: {
        suggestions: getSystemSuggestions(),
        total: getSystemSuggestions().length
      }
    }
  }

  const allSuggestions = getSystemSuggestions()
  const filtered = allSuggestions.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description?.toLowerCase().includes(query.toLowerCase()) ||
    item.category?.toLowerCase().includes(query.toLowerCase()) ||
    item.breadcrumb?.toLowerCase().includes(query.toLowerCase())
  )

  return {
    success: true,
    data: {
      suggestions: filtered.slice(0, 5),
      total: filtered.length
    }
  }
}

const GlobalSearchComponent: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showHistory, setShowHistory] = useState(false)

  const inputRef = useRef<InputRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<NodeJS.Timeout>()
  const navigate = useNavigate()

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      setLoading(true)
      try {
        const response = await mockSearchAPI(query)
        if (response.success) {
          setSuggestions(response.data.suggestions)
          setShowHistory(!query.trim())
        }
      } catch (error) {
        console.error('搜索出错:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 200),
    []
  )

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    setSelectedIndex(-1)
    clearHideTimer()

    if (isOpen) {
      debouncedSearch(value)
    }
  }

  // 处理聚焦
  const handleFocus = () => {
    setIsOpen(true)
    setSelectedIndex(-1)
    clearHideTimer()
    debouncedSearch(searchValue)
  }

  // 处理失焦
  const handleBlur = () => {
    setHideTimer()
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else if (searchValue.trim()) {
          handleSearch(searchValue)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) return

    // 简单的搜索路由映射
    const searchRoutes: { [key: string]: string } = {
      '仪表板': '/dashboard',
      '用户': '/users',
      '用户管理': '/users',
      '订单': '/orders',
      '订单管理': '/orders',
      '任务': '/tasks',
      '任务管理': '/tasks',
      '支付': '/payments',
      '支付管理': '/payments',
      '聊天': '/chat',
      '聊天管理': '/chat',
      '报表': '/reports',
      '数据报表': '/reports',
      '设置': '/settings',
      '系统设置': '/settings',
    }

    // 查找匹配的路由
    for (const [key, path] of Object.entries(searchRoutes)) {
      if (value.includes(key)) {
        navigate(path)
        resetSearch()
        return
      }
    }

    // 默认跳转到仪表板
    navigate('/dashboard')
    resetSearch()
  }

  // 处理建议点击
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(suggestion.path)
    resetSearch()
  }

  // 处理建议项鼠标进入
  const handleSuggestionMouseEnter = (index: number) => {
    setSelectedIndex(index)
  }

  // 重置搜索状态
  const resetSearch = () => {
    setSearchValue('')
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    setShowHistory(false)
  }

  // 清除定时器
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = undefined
    }
  }

  // 设置隐藏定时器
  const setHideTimer = () => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  // 处理下拉框鼠标进入
  const handleDropdownMouseEnter = () => {
    clearHideTimer()
  }

  // 处理下拉框鼠标离开
  const handleDropdownMouseLeave = () => {
    setHideTimer()
  }

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      clearHideTimer()
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <div
      ref={containerRef}
      className="global-search-dropdown"
      onMouseLeave={handleDropdownMouseLeave}
    >
      {/* 搜索输入框 */}
      <div className="search-input-container">
        <Input
          ref={inputRef}
          className="global-search-input"
          placeholder="搜索用户、订单、任务..."
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          allowClear
          prefix={<SearchOutlined />}
        />
      </div>

      {/* 搜索建议下拉框 */}
      {isOpen && (
        <div
          className="search-suggestions-dropdown"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {loading ? (
            <div className="search-loading">
              <span>搜索中...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {/* 标题 */}
              <div className="search-section-title">
                {showHistory ? 'Recent searches' : '搜索建议'}
              </div>

              {/* 建议项列表 */}
              <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`search-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => handleSuggestionMouseEnter(index)}
                  >
                    <div className="suggestion-icon">
                      {suggestion.icon || '#'}
                    </div>
                    <div className="suggestion-content">
                      {suggestion.breadcrumb && (
                        <div className="suggestion-breadcrumb">
                          {suggestion.breadcrumb}
                        </div>
                      )}
                      <div className="suggestion-title">
                        {suggestion.title}
                      </div>
                      {suggestion.description && (
                        <div className="suggestion-description">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchValue.trim() ? (
            <div className="search-empty">
              <span>暂无匹配结果</span>
            </div>
          ) : (
            <div className="search-empty">
              <span>暂无搜索记录</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearchComponent