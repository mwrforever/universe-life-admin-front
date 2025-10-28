import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../index'

// Base query with authentication
export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    // Set common headers
    headers.set('content-type', 'application/json')
    headers.set('accept', 'application/json')

    return headers
  },
  // Add timeout configuration
  timeout: 10000,
})

// Base query with error handling
export const baseQueryWithReauth = async (
  args: unknown,
  api: { dispatch: (action: unknown) => void; getState: () => unknown },
  extraOptions: Record<string, unknown>
) => {
  let result = await baseQuery(args, api, extraOptions)

  // Handle 401 unauthorized errors
  if (result.error && result.error.status === 401) {
    console.log('Token expired or invalid, attempting refresh...')

    // Try to get new token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {
          refreshToken: (api.getState() as RootState).auth.refreshToken
        }
      },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      // Store the new token
      api.dispatch({ type: 'auth/setToken', payload: refreshResult.data })

      // Retry the original request
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' })
    }
  }

  return result
}

// Tag types for cache invalidation
export const tagTypes = [
  'User',
  'Task',
  'Payment',
  'Chat',
  'Message',
  'Report',
  'Notification',
  'AIService',
  'File',
  'System'
] as const

// Base API definition
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes,
  endpoints: () => ({}),
})