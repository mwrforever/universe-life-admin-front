/**
 * 全局搜索组件类型定义
 */

// 搜索建议项接口
export interface SearchItem {
  id: string
  title: string
  description?: string
  url: string
  timestamp: number
  category?: string
  icon?: string
}

// 搜索状态接口
export interface SearchState {
  open: boolean
  keyword: string
  activeIndex: number
  recentSearches: SearchItem[]
  suggestions: SearchItem[]
  loading: boolean
}

// 搜索组件Props接口
export interface GlobalSearchProps {
  placeholder?: string
  maxHistoryItems?: number
  onSearch?: (keyword: string) => void
  onSelect?: (item: SearchItem) => void
  className?: string
  style?: React.CSSProperties
}

// 搜索建议项Props接口
export interface SearchSuggestionItemProps {
  item: SearchItem
  isActive: boolean
  keyword?: string
  onClick: (item: SearchItem) => void
  onMouseEnter: (index: number) => void
  index: number
}

// 搜索历史记录Props接口
export interface SearchHistoryProps {
  items: SearchItem[]
  onClear: () => void
  onSelect: (item: SearchItem) => void
  onMouseEnter: (index: number) => void
  activeIndex: number
  startIndex: number
}

// 键盘导航枚举
export enum KeyboardAction {
  ARROW_DOWN = 'ArrowDown',
  ARROW_UP = 'ArrowUp',
  ENTER = 'Enter',
  ESCAPE = 'Escape',
}

// 历史记录操作类型
export type HistoryAction =
  | { type: 'ADD'; payload: SearchItem }
  | { type: 'REMOVE'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; payload: SearchItem[] }

// 搜索动作类型
export type SearchAction =
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_KEYWORD'; payload: string }
  | { type: 'SET_ACTIVE_INDEX'; payload: number }
  | { type: 'SET_SUGGESTIONS'; payload: SearchItem[] }
  | { type: 'SET_LOADING'; payload: boolean }

// 响应式断点
export const BREAKPOINTS = {
  MOBILE: 375,
  TABLET: 768,
  DESKTOP: 1200,
} as const

// 搜索方向枚举
export enum SearchDirection {
  DOWN = 'down',
  UP = 'up',
}

// 动画状态
export interface AnimationState {
  entering: boolean
  exiting: boolean
  visible: boolean
}

// 高亮匹配结果
export interface HighlightMatch {
  text: string
  isMatch: boolean
}

// 搜索上下文接口
export interface SearchContextType {
  state: SearchState
  dispatch: React.Dispatch<SearchAction>
  historyDispatch: React.Dispatch<HistoryAction>
  onKeywordChange: (keyword: string) => void
  onItemSelect: (item: SearchItem) => void
  onClearHistory: () => void
}