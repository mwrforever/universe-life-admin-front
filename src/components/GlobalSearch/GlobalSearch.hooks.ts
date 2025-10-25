/**
 * 全局搜索组件自定义hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { debounce } from 'lodash-es'
import type { SearchItem, SearchState, KeyboardAction } from './GlobalSearch.types'

// 本地存储键名
const STORAGE_KEY = 'global-search-history'
const MAX_HISTORY_ITEMS = 10

// 搜索历史管理hook
export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchItem[]>([])

  // 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as SearchItem[]
        setHistory(items.filter(item => item && item.title))
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
    }
  }, [])

  // 添加到历史记录
  const addToHistory = useCallback((item: SearchItem) => {
    setHistory(prevHistory => {
      const newHistory = [item, ...prevHistory.filter(h => h.url !== item.url)]
      const trimmed = newHistory.slice(0, MAX_HISTORY_ITEMS)

      // 保存到localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } catch (error) {
        console.warn('Failed to save search history:', error)
      }

      return trimmed
    })
  }, [])

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear search history:', error)
    }
  }, [])

  return {
    history,
    addToHistory,
    clearHistory,
  }
}

// 防抖搜索hook
export const useSearchDebounce = (
  onSearch: (keyword: string) => void,
  delay: number = 200
) => {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce(async (searchKeyword: string) => {
      if (!searchKeyword.trim()) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        await onSearch(searchKeyword)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, delay),
    [onSearch, delay]
  )

  // 处理输入变化
  const handleKeywordChange = useCallback((newKeyword: string) => {
    setKeyword(newKeyword)
    debouncedSearch(newKeyword)
  }, [debouncedSearch])

  // 清理防抖函数
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return {
    keyword,
    setKeyword: handleKeywordChange,
    loading,
  }
}

// 键盘导航hook
export const useSearchKeyboard = (
  items: SearchItem[],
  onSelect: (item: SearchItem) => void,
  onEscape?: () => void
) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  // 处理键盘事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex(prev =>
          prev < items.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : items.length - 1
        )
        break

      case 'Enter':
        event.preventDefault()
        if (activeIndex >= 0 && activeIndex < items.length) {
          onSelect(items[activeIndex])
        }
        break

      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
    }
  }, [items, activeIndex, onSelect, onEscape])

  // 重置激活索引
  const resetActiveIndex = useCallback(() => {
    setActiveIndex(-1)
  }, [])

  // 当项目列表变化时重置索引
  useEffect(() => {
    resetActiveIndex()
  }, [items.length, resetActiveIndex])

  return {
    activeIndex,
    setActiveIndex,
    resetActiveIndex,
    handleKeyDown,
  }
}

// 搜索状态管理hook
export const useSearchState = () => {
  const [state, setState] = useState<SearchState>({
    open: false,
    keyword: '',
    activeIndex: -1,
    recentSearches: [],
    suggestions: [],
    loading: false,
  })

  const updateState = useCallback((updates: Partial<SearchState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const openSearch = useCallback(() => {
    updateState({ open: true })
  }, [updateState])

  const closeSearch = useCallback(() => {
    updateState({ open: false, activeIndex: -1 })
  }, [updateState])

  const setKeyword = useCallback((keyword: string) => {
    updateState({ keyword })
  }, [updateState])

  const setSuggestions = useCallback((suggestions: SearchItem[]) => {
    updateState({ suggestions })
  }, [updateState])

  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading })
  }, [updateState])

  return {
    state,
    updateState,
    openSearch,
    closeSearch,
    setKeyword,
    setSuggestions,
    setLoading,
  }
}

// 点击外部关闭hook
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutside: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [ref, onClickOutside])
}

// 延迟关闭hook
export const useDelayedClose = (
  onClose: () => void,
  delay: number = 200
) => {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const scheduleClose = useCallback(() => {
    timeoutRef.current = setTimeout(onClose, delay)
  }, [onClose, delay])

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return cancelClose
  }, [cancelClose])

  return {
    scheduleClose,
    cancelClose,
  }
}

// 搜索建议模拟API hook
export const useSearchSuggestions = () => {
  const navigate = useNavigate()

  // 模拟搜索建议API
  const fetchSuggestions = useCallback(async (keyword: string): Promise<SearchItem[]> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 100))

    // 预定义的建议数据
    const allSuggestions: SearchItem[] = [
      {
        id: '1',
        title: '用户管理',
        description: '管理系统用户信息，包括用户列表、权限配置',
        url: '/users',
        timestamp: Date.now(),
        category: '系统管理',
        icon: '👥',
      },
      {
        id: '2',
        title: '任务管理',
        description: '创建和分配任务，跟踪任务进度',
        url: '/tasks',
        timestamp: Date.now(),
        category: '任务管理',
        icon: '✅',
      },
      {
        id: '3',
        title: '支付管理',
        description: '管理支付流程和交易记录',
        url: '/payments',
        timestamp: Date.now(),
        category: '支付系统',
        icon: '💳',
      },
      {
        id: '4',
        title: '聊天记录',
        description: '查看用户聊天记录和客服数据',
        url: '/chat',
        timestamp: Date.now(),
        category: '客服管理',
        icon: '💬',
      },
      {
        id: '5',
        title: '数据报表',
        description: '生成各类数据分析报表',
        url: '/reports',
        timestamp: Date.now(),
        category: '数据分析',
        icon: '📊',
      },
    ]

    // 根据关键词过滤
    if (!keyword.trim()) {
      return []
    }

    return allSuggestions.filter(item =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.category?.toLowerCase().includes(keyword.toLowerCase())
    )
  }, [])

  // 处理项目选择
  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.url)
  }, [navigate])

  return {
    fetchSuggestions,
    handleSelect,
  }
}