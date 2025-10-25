import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getReports: builder.query({
      query: () => '/reports',
    }),
    getReportById: builder.query({
      query: (id) => `/reports/${id}`,
    }),
    generateReport: builder.mutation({
      query: (reportConfig) => ({
        url: '/reports/generate',
        method: 'POST',
        body: reportConfig,
      }),
    }),
    getAnalytics: builder.query({
      query: (params) => ({
        url: '/reports/analytics',
        params,
      }),
    }),
  }),
})

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGenerateReportMutation,
  useGetAnalyticsQuery,
} = reportsApi