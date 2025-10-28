import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Specific hooks for common patterns
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()

  return {
    ...auth,
    dispatch,
  }
}

export const useSocketState = () => {
  const socket = useAppSelector(state => state.socket)
  const dispatch = useAppDispatch()

  return {
    ...socket,
    dispatch,
  }
}

export const useNotifications = () => {
  const notifications = useAppSelector(state => state.notifications)
  const dispatch = useAppDispatch()

  return {
    ...notifications,
    dispatch,
  }
}

export const useUIState = () => {
  const ui = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch()

  return {
    ...ui,
    dispatch,
  }
}