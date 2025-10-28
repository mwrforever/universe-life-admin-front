import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Report {
  id: string
  title: string
  type: 'user' | 'task' | 'payment' | 'system'
  data: any
  createdAt: Date
  generatedBy: string
}

interface ReportsState {
  reports: Report[]
  selectedReport: Report | null
  loading: boolean
  error: string | null
}

const initialState: ReportsState = {
  reports: [],
  selectedReport: null,
  loading: false,
  error: null,
}

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload
    },
    setSelectedReport: (state, action: PayloadAction<Report | null>) => {
      state.selectedReport = action.payload
    },
    addReport: (state, action: PayloadAction<Report>) => {
      state.reports.unshift(action.payload)
    },
    generateReport: (state, action: PayloadAction<Partial<Report>>) => {
      const newReport: Report = {
        id: Date.now().toString(),
        title: action.payload.title || '新报告',
        type: action.payload.type || 'analytics',
        status: 'generating',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...action.payload,
      }
      state.reports.unshift(newReport)
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setReports,
  setSelectedReport,
  addReport,
  generateReport,
  clearError,
} = reportsSlice.actions

export default reportsSlice.reducer