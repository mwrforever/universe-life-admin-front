import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery, tagTypes } from './baseApi'

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
  baseQuery,
  tagTypes,
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: () => '/payments',
    }),
    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
    }),
    createPayment: builder.mutation({
      query: (payment) => ({
        url: '/payments',
        method: 'POST',
        body: payment,
      }),
    }),
    getTransactions: builder.query({
      query: () => '/payments/transactions',
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useGetTransactionsQuery,
} = paymentsApi