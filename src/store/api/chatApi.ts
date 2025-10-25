import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getChatRooms: builder.query({
      query: () => '/chat/rooms',
    }),
    getChatMessages: builder.query({
      query: (roomId) => `/chat/rooms/${roomId}/messages`,
    }),
    sendMessage: builder.mutation({
      query: ({ roomId, content, type = 'text' }) => ({
        url: '/chat/send',
        method: 'POST',
        body: { roomId, content, type },
      }),
    }),
    joinRoom: builder.mutation({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/join`,
        method: 'POST',
      }),
    }),
    leaveRoom: builder.mutation({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/leave`,
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetChatRoomsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useJoinRoomMutation,
  useLeaveRoomMutation,
} = chatApi