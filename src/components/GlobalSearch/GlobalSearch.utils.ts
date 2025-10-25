/**
 * 全局搜索组件工具函数
 */

import type { SearchItem, HighlightMatch } from './GlobalSearch.types'

// 本地存储相关常量
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'global-search-history',
  USER_PREFERENCES: 'global-search-preferences',
} as const

// 搜索相关常量
export const SEARCH_CONSTANTS = {
  MAX_HISTORY_ITEMS: 10,
  DEBOUNCE_DELAY: 200,
  MIN_SEARCH_LENGTH: 1,
  MAX_SUGGESTIONS: 5,
  HIGHLIGHT_TAG: 'strong',
} as const

/**
 * 高亮文本中的关键词
 * @param text 原始文本
 * @param keyword 关键词
 * @returns 高亮结果数组
 */
export const highlightText = (text: string, keyword: string): HighlightMatch[] => {
  if (!keyword || !text) {
    return [{ text, isMatch: false }]
  }

  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  const matches = text.split(regex)

  return matches.map(match => ({
    text: match,
    isMatch: match.toLowerCase() === keyword.toLowerCase(),
  }))
}

/**
 * 转义正则表达式特殊字符
 * @param string 要转义的字符串
 * @returns 转义后的字符串
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export const generateId = (prefix: string = 'search'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 格式化时间戳为相对时间
 * @param timestamp 时间戳
 * @returns 格式化的时间字符串
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute)
    return `${minutes}分钟前`
  } else if (diff < day) {
    const hours = Math.floor(diff / hour)
    return `${hours}小时前`
  } else if (diff < week) {
    const days = Math.floor(diff / day)
    return `${days}天前`
  } else if (diff < month) {
    const weeks = Math.floor(diff / week)
    return `${weeks}周前`
  } else {
    const months = Math.floor(diff / month)
    return `${months}个月前`
  }
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any
  }

  if (typeof obj === 'object') {
    const cloned = {} as any
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key])
    })
    return cloned
  }

  return obj
}

/**
 * 检查是否为空值
 * @param value 要检查的值
 * @returns 是否为空
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * 安全的JSON解析
 * @param jsonString JSON字符串
 * @param defaultValue 默认值
 * @returns 解析结果
 */
export const safeJsonParse = <T = any>(
  jsonString: string,
  defaultValue: T
): T => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('JSON parse failed:', error)
    return defaultValue
  }
}

/**
 * 安全的JSON字符串化
 * @param obj 要转换的对象
 * @param defaultValue 默认值
 * @returns JSON字符串
 */
export const safeJsonStringify = (
  obj: any,
  defaultValue: string = '{}'
): string => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    console.warn('JSON stringify failed:', error)
    return defaultValue
  }
}

/**
 * 获取URL路径
 * @param url 完整URL
 * @returns 路径部分
 */
export const getPathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.pathname
  } catch {
    return url
  }
}

/**
 * 检查URL是否为外部链接
 * @param url URL
 * @returns 是否为外部链接
 */
export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin)
    return urlObj.origin !== window.location.origin
  } catch {
    return false
  }
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 移除HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 检查是否为移动设备
 * @returns 是否为移动设备
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 获取设备类型
 * @returns 设备类型
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = navigator.userAgent.toLowerCase()

  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile'
  }

  if (/tablet|ipad|android(?!.*mobile)/i.test(userAgent)) {
    return 'tablet'
  }

  return 'desktop'
}

/**
 * 获取响应式断点
 * @returns 当前断点
 */
export const getCurrentBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth

  if (width < 768) {
    return 'mobile'
  } else if (width < 1200) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

/**
 * 滚动到元素
 * @param element 目标元素
 * @param options 滚动选项
 */
export const scrollToElement = (
  element: Element,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
): void => {
  element.scrollIntoView(options)
}

/**
 * 检查元素是否在视口中
 * @param element 目标元素
 * @returns 是否在视口中
 */
export const isElementInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}