// Export socket client
import socketClient from './client'
export { socketClient }
export type {
  ClientToServerEvents,
  ServerToClientEvents,
  SendMessageData,
  AuthData,
  AuthError,
  Message,
  MessageAttachment,
  MessageReadReceipt,
  UserJoinedChat,
  UserLeftChat,
  UserTyping,
  UserStoppedTyping,
  MessagesRead,
  Notification,
  Task,
  ConnectedData,
  SocketError,
} from './client'

// Export socket hooks
export * from './hooks'

// Socket utilities
export const socketUtils = {
  /**
   * Check if socket is available in browser environment
   */
  isSocketAvailable(): boolean {
    return typeof window !== 'undefined' && 'io' in window
  },

  /**
   * Format message for display
   */
  formatMessage(message: Record<string, unknown>): Record<string, unknown> {
    return {
      ...message,
      createdAt: new Date(message.createdAt as string),
      isOwn: message.senderId === this.getCurrentUserId(),
    }
  },

  /**
   * Get current user ID from local storage
   */
  getCurrentUserId(): string | null {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user).id : null
    } catch {
      return null
    }
  },

  /**
   * Generate unique ID for temporary messages
   */
  generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  },

  /**
   * Validate message content
   */
  validateMessage(content: string): boolean {
    return content.trim().length > 0 && content.length <= 4000
  },

  /**
   * Truncate message if too long
   */
  truncateMessage(content: string, maxLength: number = 100): string {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content
  },

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  },

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(mimeType: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]

    return supportedTypes.includes(mimeType)
  },

  /**
   * Get file icon based on MIME type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
    if (mimeType.startsWith('text/')) return '📃'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.startsWith('video/')) return '🎬'
    return '📎'
  },

  /**
   * Create socket connection status
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (!socketClient) return 'disconnected'

    if (socketClient.isConnected()) return 'connected'

    // This would need to be enhanced based on actual socket state
    return 'disconnected'
  },
}