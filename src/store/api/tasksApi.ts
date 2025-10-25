import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => '/tasks',
    }),
    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
    }),
    createTask: builder.mutation({
      query: (task) => ({
        url: '/tasks',
        method: 'POST',
        body: task,
      }),
    }),
    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi