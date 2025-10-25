import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const aiServiceApi = createApi({
  reducerPath: 'aiServiceApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getAISessions: builder.query({
      query: () => '/ai-service/sessions',
    }),
    createAISession: builder.mutation({
      query: (sessionConfig) => ({
        url: '/ai-service/sessions',
        method: 'POST',
        body: sessionConfig,
      }),
    }),
    sendMessageToAI: builder.mutation({
      query: ({ sessionId, message }) => ({
        url: `/ai-service/sessions/${sessionId}/messages`,
        method: 'POST',
        body: { message },
      }),
    }),
    getSessionHistory: builder.query({
      query: (sessionId) => `/ai-service/sessions/${sessionId}/history`,
    }),
  }),
})

export const {
  useGetAISessionsQuery,
  useCreateAISessionMutation,
  useSendMessageToAIMutation,
  useGetSessionHistoryQuery,
} = aiServiceApi