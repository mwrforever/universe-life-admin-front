import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AIService {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive'
  config: any
  createdAt: Date
}

interface AIServicesState {
  services: AIService[]
  selectedService: AIService | null
  loading: boolean
  error: string | null
}

const initialState: AIServicesState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
}

const aiServiceSlice = createSlice({
  name: 'aiService',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setServices: (state, action: PayloadAction<AIService[]>) => {
      state.services = action.payload
    },
    setSelectedService: (state, action: PayloadAction<AIService | null>) => {
      state.selectedService = action.payload
    },
    addService: (state, action: PayloadAction<AIService>) => {
      state.services.unshift(action.payload)
    },
    updateService: (state, action: PayloadAction<AIService>) => {
      const index = state.services.findIndex(service => service.id === action.payload.id)
      if (index !== -1) {
        state.services[index] = action.payload
      }
      if (state.selectedService?.id === action.payload.id) {
        state.selectedService = action.payload
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
  setServices,
  setSelectedService,
  addService,
  updateService,
  clearError,
} = aiServiceSlice.actions

export default aiServiceSlice.reducer