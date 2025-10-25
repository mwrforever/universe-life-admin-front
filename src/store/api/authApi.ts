import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
  }),
})
