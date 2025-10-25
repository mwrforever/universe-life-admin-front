import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
  }),
})

export const { useGetUsersQuery, useGetUserByIdQuery, useUpdateUserMutation } = usersApi