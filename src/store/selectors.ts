/**
 * Redux selectors
 */

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'

// Basic selectors
export const selectAuth = (state: RootState) => state.auth
export const selectUsers = (state: RootState) => state.users
export const selectTasks = (state: RootState) => state.tasks
export const selectPayments = (state: RootState) => state.payments
export const selectChat = (state: RootState) => state.chat
export const selectReports = (state: RootState) => state.reports
export const selectAiService = (state: RootState) => state.aiService
export const selectUi = (state: RootState) => state.ui
export const selectNotifications = (state: RootState) => state.notifications

// Auth selectors
export const selectCurrentUser = createSelector([selectAuth], (auth) => auth.user)
export const selectIsAuthenticated = createSelector([selectAuth], (auth) => auth.isAuthenticated)
export const selectAuthLoading = createSelector([selectAuth], (auth) => auth.isLoading)
export const selectAuthToken = createSelector([selectAuth], (auth) => auth.token)

// Users selectors
export const selectAllUsers = createSelector([selectUsers], (users) => users.users)
export const selectUsersLoading = createSelector([selectUsers], (users) => users.loading)
export const selectSelectedUser = createSelector([selectUsers], (users) => users.currentUser)

// Tasks selectors
export const selectAllTasks = createSelector([selectTasks], (tasks) => tasks.tasks)
export const selectTasksLoading = createSelector([selectTasks], (tasks) => tasks.loading)
export const selectSelectedTask = createSelector([selectTasks], (tasks) => tasks.selectedTask)
export const selectTasksFilter = createSelector([selectTasks], (tasks) => tasks.filters)

// Payments selectors
export const selectAllPayments = createSelector([selectPayments], (payments) => payments.payments)
export const selectPaymentsLoading = createSelector([selectPayments], (payments) => payments.loading)
export const selectSelectedPayment = createSelector([selectPayments], (payments) => payments.selectedPayment)

// Chat selectors
export const selectMessages = createSelector([selectChat], (chat) => chat.messages)
export const selectOnlineUsers = createSelector([selectChat], (chat) => chat.onlineUsers)
export const selectCurrentRoom = createSelector([selectChat], (chat) => chat.currentRoom)
export const selectChatLoading = createSelector([selectChat], (chat) => chat.loading)

// Reports selectors
export const selectAllReports = createSelector([selectReports], (reports) => reports.reports)
export const selectReportsLoading = createSelector([selectReports], (reports) => reports.loading)

// AI Service selectors
export const selectAllAIServices = createSelector([selectAiService], (aiService) => aiService.services)
export const selectAIServicesLoading = createSelector([selectAiService], (aiService) => aiService.loading)
export const selectSelectedAIService = createSelector([selectAiService], (aiService) => aiService.selectedService)

// UI selectors
export const selectSidebarCollapsed = createSelector([selectUi], (ui) => ui.sidebarCollapsed)
export const selectTheme = createSelector([selectUi], (ui) => ui.theme)
export const selectLoading = createSelector([selectUi], (ui) => ui.loading)

// Notifications selectors
export const selectAllNotifications = createSelector([selectNotifications], (notifications) => notifications.notifications)
export const selectUnreadCount = createSelector([selectNotifications], (notifications) =>
  notifications.notifications.filter((n: any) => !n.read).length
)