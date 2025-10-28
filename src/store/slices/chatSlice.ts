import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  roomId: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  fileUrl?: string
  fileName?: string
}

interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  participants: string[]
  createdAt: Date
  lastMessage?: Message
  unreadCount?: number
}

interface ChatState {
  messages: Message[]
  rooms: ChatRoom[]
  currentRoom: ChatRoom | null
  onlineUsers: string[]
  socket: any // Socket.IO instance
  loading: boolean
  error: string | null
  isConnected: boolean
  typingUsers: string[]
}

const initialState: ChatState = {
  messages: [],
  rooms: [],
  currentRoom: null,
  onlineUsers: [],
  socket: null,
  loading: false,
  error: null,
  isConnected: false,
  typingUsers: [],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setSocket: (state, action: PayloadAction<any>) => {
      state.socket = action.payload
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.rooms = action.payload
    },
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload
    },
    addRoom: (state, action: PayloadAction<ChatRoom>) => {
      state.rooms.unshift(action.payload)
    },
    updateRoom: (state, action: PayloadAction<ChatRoom>) => {
      const index = state.rooms.findIndex(room => room.id === action.payload.id)
      if (index !== -1) {
        state.rooms[index] = action.payload
      }
      if (state.currentRoom?.id === action.payload.id) {
        state.currentRoom = action.payload
      }
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload)
      if (state.currentRoom?.id === action.payload) {
        state.currentRoom = null
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
      // Update room's last message
      const room = state.rooms.find(r => r.id === action.payload.roomId)
      if (room) {
        room.lastMessage = action.payload
        if (room.id !== state.currentRoom?.id) {
          room.unreadCount = (room.unreadCount || 0) + 1
        }
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = action.payload
      }
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload)
    },
    clearMessages: (state) => {
      state.messages = []
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload
    },
    addUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload)
      }
    },
    removeUserOnline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(userId => userId !== action.payload)
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload
    },
    addUserTyping: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload)
      }
    },
    removeUserTyping: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(userId => userId !== action.payload)
    },
    markRoomAsRead: (state, action: PayloadAction<string>) => {
      const room = state.rooms.find(r => r.id === action.payload)
      if (room) {
        room.unreadCount = 0
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setSocket,
  setConnected,
  setRooms,
  setCurrentRoom,
  addRoom,
  updateRoom,
  removeRoom,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  setOnlineUsers,
  addUserOnline,
  removeUserOnline,
  setTypingUsers,
  addUserTyping,
  removeUserTyping,
  markRoomAsRead,
  clearError,
} = chatSlice.actions

export default chatSlice.reducer

export type { Message, ChatRoom, ChatState }