import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request timestamp
        config.metadata = { startTime: new Date() }

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const endTime = new Date()
        const duration = endTime.getTime() - response.config.metadata?.startTime?.getTime()

        // Log in development
        if (import.meta.env.DEV) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`)
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Attempt to refresh token
            const newToken = await this.refreshToken()
            if (newToken) {
              // Store new token
              this.setAuthToken(newToken)

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.clearAuth()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        // Handle other errors
        const errorMessage = this.getErrorMessage(error)
        console.error('❌ API Error:', errorMessage)

        return Promise.reject({
          ...error,
          message: errorMessage,
          userMessage: this.getUserFriendlyMessage(error),
        })
      }
    )
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('token', token)
  }

  private clearAuth(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('refreshToken')
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        refreshToken,
      })

      const { token, refreshToken: newRefreshToken } = response.data.data
      this.setAuthToken(token)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      return token
    } catch (error) {
      throw new Error('Failed to refresh token')
    }
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 400:
          return data?.message || '请求参数错误'
        case 401:
          return '身份验证失败'
        case 403:
          return '权限不足'
        case 404:
          return '请求的资源不存在'
        case 422:
          return data?.message || '数据验证失败'
        case 429:
          return '请求过于频繁，请稍后重试'
        case 500:
          return '服务器内部错误'
        case 502:
          return '网关错误'
        case 503:
          return '服务暂时不可用'
        default:
          return data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // Network error
      return '网络连接失败，请检查网络设置'
    } else {
      // Other error
      return error.message || '未知错误'
    }
  }

  private getUserFriendlyMessage(error: AxiosError): string {
    const message = this.getErrorMessage(error)

    // In production, return user-friendly messages
    if (!import.meta.env.DEV) {
      return '操作失败，请稍后重试'
    }

    return message
  }

  // Public API methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }

  // File upload
  public upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })
  }

  // Download file
  public download(url: string, filename?: string): Promise<void> {
    return this.client.get(url, {
      responseType: 'blob',
    }).then((response) => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime?: Date
    }
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()
export default apiClient