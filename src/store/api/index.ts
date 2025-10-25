// Export all API slices
export { baseQuery, baseQueryWithReauth, tagTypes, apiSlice } from './baseApi'

// Re-export for convenience
export * from './authApi'
export * from './usersApi'
export * from './tasksApi'
export * from './paymentsApi'
export * from './chatApi'
export * from './reportsApi'
export * from './aiServiceApi'

// API utilities
export const handleApiError = (error: any): string => {
  if (error?.status === 400) {
    return error?.data?.message || '请求参数错误'
  }
  if (error?.status === 401) {
    return '身份验证失败，请重新登录'
  }
  if (error?.status === 403) {
    return '没有权限执行此操作'
  }
  if (error?.status === 404) {
    return '请求的资源不存在'
  }
  if (error?.status === 500) {
    return '服务器内部错误'
  }
  if (error?.status === 'NETWORK_ERROR') {
    return '网络连接失败，请检查网络设置'
  }
  if (error?.status === 'TIMEOUT') {
    return '请求超时，请稍后重试'
  }

  return error?.data?.message || error?.message || '未知错误'
}

export const isApiError = (error: any): boolean => {
  return error && typeof error === 'object' && 'status' in error
}

export const getApiErrorCode = (error: any): string | null => {
  if (!isApiError(error)) return null
  return error?.data?.code || null
}