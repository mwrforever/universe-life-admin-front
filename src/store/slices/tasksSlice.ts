import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  category: string
  budget: number
  deadline: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  assignedTo?: string
  location?: string
  requirements?: string[]
  images?: string[]
}

interface TasksState {
  tasks: Task[]
  selectedTask: Task | null
  loading: boolean
  error: string | null
  filters: TaskFilters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface TaskFilters {
  status?: Task['status']
  priority?: Task['priority']
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
  budgetRange?: {
    min: number
    max: number
  }
  search?: string
  sortBy?: 'createdAt' | 'deadline' | 'budget' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = action.payload
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload)
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null
      }
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload
    },
    setPagination: (state, action: PayloadAction<Partial<TasksState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setTasks,
  setSelectedTask,
  addTask,
  updateTask,
  removeTask,
  setFilters,
  setPagination,
  clearError,
} = tasksSlice.actions

export default tasksSlice.reducer

export type { Task, TaskFilters, TasksState }