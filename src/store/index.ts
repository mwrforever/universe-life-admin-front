/**
 * 万象生活 Redux Store 配置
 * 使用 Redux Toolkit 进行状态管理
 */

import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'

// Import slices
import authReducer from './slices/authSlice'
import usersReducer from './slices/usersSlice'
import tasksReducer from './slices/tasksSlice'
import paymentsReducer from './slices/paymentsSlice'
import chatReducer from './slices/chatSlice'
import reportsReducer from './slices/reportsSlice'
import aiServiceReducer from './slices/aiServiceSlice'
import uiReducer from './slices/uiSlice'
import notificationsReducer from './slices/notificationsSlice'

// 配置 Redux Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    tasks: tasksReducer,
    payments: paymentsReducer,
    chat: chatReducer,
    reports: reportsReducer,
    aiService: aiServiceReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略一些非序列化检查，比如 socket.io 实例
        ignoredActions: ['chat/setSocket', 'chat/setOnlineUsers'],
        ignoredPaths: ['chat.socket'],
      },
    }),
  devTools: import.meta.env.NODE_ENV !== 'production',
})

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// 导出 hooks
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// 导出 selectors
export * from './selectors'

// 导出 actions，避免重复命名
export {
  setLoading,
  login,
  logout,
  setUser,
  setToken,
  setRefreshToken,
  setPermissions
} from './slices/authSlice'

export {
  setLoading as setUsersLoading,
  setError as setUsersError,
  setUsers,
  setCurrentUser,
  addUser,
  updateUser,
  removeUser,
  setFilters,
  setPagination,
  clearError as clearUsersError
} from './slices/usersSlice'

export {
  setLoading as setTasksLoading,
  setError as setTasksError,
  setTasks,
  setSelectedTask,
  addTask,
  updateTask,
  removeTask,
  setFilters as setTasksFilters,
  setPagination as setTasksPagination,
  clearError as clearTasksError
} from './slices/tasksSlice'

export {
  setLoading as setPaymentsLoading,
  setError as setPaymentsError,
  setPayments,
  setSelectedPayment,
  addPayment,
  updatePayment,
  clearError as clearPaymentsError
} from './slices/paymentsSlice'

export {
  setLoading as setChatLoading,
  setError as setChatError,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  setTypingUsers,
  clearError as clearChatError
} from './slices/chatSlice'

export {
  setLoading as setReportsLoading,
  setError as setReportsError,
  setReports,
  setSelectedReport,
  generateReport,
  clearError as clearReportsError
} from './slices/reportsSlice'

export {
  setLoading as setAIServiceLoading,
  setError as setAIServiceError,
  setServices as setAIServices,
  setSelectedService as setSelectedAIService,
  addService as addAIService,
  updateService as updateAIService,
  clearError as clearAIServiceError
} from './slices/aiServiceSlice'

export {
  setTheme,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications
} from './slices/uiSlice'

export {
  setLoading as setNotificationsLoading,
  setError as setNotificationsError,
  setNotifications,
  markAsRead,
  markAllAsRead,
  clearError as clearNotificationsError
} from './slices/notificationsSlice'