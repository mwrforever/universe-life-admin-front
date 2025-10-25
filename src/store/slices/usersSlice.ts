import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { UsersState, User, UserFilters, Pagination } from '@/types/user'

const initialState: UsersState = {
  currentUser: null,
  users: [],
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

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.unshift(action.payload)
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id)
      if (index !== -1) {
        state.users[index] = action.payload
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload)
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null
      }
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload
    },
    setPagination: (state, action: PayloadAction<Partial<Pagination>>) => {
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
  setUsers,
  setCurrentUser,
  addUser,
  updateUser,
  removeUser,
  setFilters,
  setPagination,
  clearError,
} = usersSlice.actions

export default usersSlice.reducer
