import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Payment {
  id: string
  amount: number
  type: 'income' | 'expense'
  status: 'pending' | 'completed' | 'failed'
  description: string
  taskId?: string
  userId: string
  createdAt: Date
  processedAt?: Date
}

interface PaymentsState {
  payments: Payment[]
  selectedPayment: Payment | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload
    },
    setSelectedPayment: (state, action: PayloadAction<Payment | null>) => {
      state.selectedPayment = action.payload
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload)
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(payment => payment.id === action.payload.id)
      if (index !== -1) {
        state.payments[index] = action.payload
      }
      if (state.selectedPayment?.id === action.payload.id) {
        state.selectedPayment = action.payload
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
  setPayments,
  setSelectedPayment,
  addPayment,
  updatePayment,
  clearError,
} = paymentsSlice.actions

export default paymentsSlice.reducer