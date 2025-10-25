import { io, Socket } from 'socket.io-client'
import type { DefaultEventsMap } from '@socket.io/component-emitter'

// Socket event interfaces
export interface ClientToServerEvents extends DefaultEventsMap {
  // Authentication
  authenticate: (token: string) => void

  // Chat events
  join_chat: (chatId: string) => void
  leave_chat: (chatId: string) => void
  send_message: (data: SendMessageData) => void
  mark_messages_read: (chatId: string, messageIds: string[]) => void
  typing_start: (chatId: string) => void
  typing_stop: (chatId: string) => void

  // Real-time notifications
  subscribe_notifications: () => void
  unsubscribe_notifications: () => void

  // System events
  heartbeat: () => void
}

export interface ServerToClientEvents extends DefaultEventsMap {
  // Authentication
  authenticated: (data: AuthData) => void
  authentication_error: (error: AuthError) => void

  // Chat events
  message_received: (message: Message) => void
  message_updated: (messageId: string, content: string) => void
  message_deleted: (messageId: string) => void
  user_joined_chat: (data: UserJoinedChat) => void
  user_left_chat: (data: UserLeftChat) => void
  user_typing: (data: UserTyping) => void
  user_stopped_typing: (data: UserStoppedTyping) => void
  messages_read: (data: MessagesRead) => void

  // User status
  user_online: (userId: string) => void
  user_offline: (userId: string) => void

  // Notifications
  notification_received: (notification: Notification) => void

  // Task updates
  task_updated: (task: Task) => void
  task_assigned: (task: Task) => void
  task_completed: (task: Task) => void

  // System events
  pong: () => void
  connected: (data: ConnectedData) => void
  disconnected: (reason: string) => void
  error: (error: SocketError) => void
}

// Type definitions
export interface SendMessageData {
  chatId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system' | 'voice'
  attachments?: File[]
  replyToId?: string
}

export interface AuthData {
  user: any
  permissions: any[]
  sessionId: string
}

export interface AuthError {
  error: string
  code: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system' | 'voice'
  attachments?: MessageAttachment[]
  replyToId?: string
  isEdited: boolean
  editedAt?: string
  isDeleted: boolean
  deletedAt?: string
  readReceipts: MessageReadReceipt[]
  createdAt: string
}

export interface MessageAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
}

export interface MessageReadReceipt {
  userId: string
  readAt: string
}

export interface UserJoinedChat {
  userId: string
  chatId: string
  user: any
}

export interface UserLeftChat {
  userId: string
  chatId: string
}

export interface UserTyping {
  userId: string
  chatId: string
}

export interface UserStoppedTyping {
  userId: string
  chatId: string
}

export interface MessagesRead {
  chatId: string
  userId: string
  messageIds: string[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    url?: string
  }
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  [key: string]: any
}

export interface ConnectedData {
  socketId: string
  userId: string
  timestamp: string
}

export interface SocketError {
  message: string
  code: string
  timestamp: string
}

class SocketClient {
  private socket: Socket<ClientToServerEvents, ServerToClientEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private isManualDisconnect = false
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor() {
    this.setupOfflineListener()
  }

  /**
   * Connect to socket server
   */
  public connect(): Promise<Socket<ClientToServerEvents, ServerToClientEvents>> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket)
        return
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'))
        return
      }

      this.isConnecting = true
      this.isManualDisconnect = false

      const token = this.getAuthToken()
      if (!token) {
        this.isConnecting = false
        reject(new Error('No authentication token available'))
        return
      }

      try {
        this.socket = io(import.meta.env.VITE_SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
        })

        this.setupEventListeners()
        this.setupHeartbeat()

        // Resolve on successful connection
        this.socket.once('connected', (data) => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          console.log('✅ Socket connected:', data)
          resolve(this.socket!)
        })

        // Reject on connection error
        this.socket.once('connect_error', (error) => {
          this.isConnecting = false
          console.error('❌ Socket connection error:', error)
          reject(error)
        })

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Disconnect from socket server
   */
  public disconnect(): void {
    this.isManualDisconnect = true
    this.clearHeartbeat()

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    console.log('🔌 Socket disconnected manually')
  }

  /**
   * Get current socket instance
   */
  public getSocket(): Socket<ClientToServerEvents, ServerToClientEvents> | null {
    return this.socket
  }

  /**
   * Check if socket is connected
   */
  public isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected to server')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      this.handleReconnect()
    })

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    // Authentication events
    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data)
    })

    this.socket.on('authentication_error', (error) => {
      console.error('❌ Socket authentication failed:', error)
      this.handleAuthError()
    })
  }

  /**
   * Setup heartbeat to keep connection alive
   */
  private setupHeartbeat(): void {
    this.clearHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat')
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  /**
   * Clear heartbeat interval
   */
  private clearHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.isManualDisconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔌 Socket reconnection stopped')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000)

    console.log(`🔄 Attempting socket reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect().catch((error) => {
          console.error('❌ Socket reconnection failed:', error)
        })
      }
    }, delay)
  }

  /**
   * Handle authentication error
   */
  private handleAuthError(): void {
    // Clear stored tokens and redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  /**
   * Setup offline/online listeners
   */
  private setupOfflineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Browser is online, attempting socket reconnection')
      if (!this.socket?.connected && !this.isManualDisconnect) {
        this.connect().catch(console.error)
      }
    })

    window.addEventListener('offline', () => {
      console.log('📵 Browser is offline')
    })
  }

  /**
   * Emit events with type safety
   */
  public emit<K extends keyof ClientToServerEvents>(
    event: K,
    ...args: Parameters<ClientToServerEvents[K]>
  ): boolean {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, cannot emit event:', event)
      return false
    }

    return this.socket.emit(event, ...args)
  }

  /**
   * Listen to events with type safety
   */
  public on<K extends keyof ServerToClientEvents>(
    event: K,
    listener: (...args: Parameters<ServerToClientEvents[K]>) => void
  ): void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot listen to event:', event)
      return
    }

    this.socket.on(event, listener)
  }

  /**
   * Stop listening to events
   */
  public off<K extends keyof ServerToClientEvents>(
    event: K,
    listener?: (...args: Parameters<ServerToClientEvents[K]>) => void
  ): void {
    if (!this.socket) return

    this.socket.off(event, listener)
  }
}

// Create and export singleton instance
export const socketClient = new SocketClient()
export default socketClient