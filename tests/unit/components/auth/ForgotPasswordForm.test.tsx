import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import authReducer from '@/store/slices/authSlice'

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        ...initialState,
      },
    },
  })
}

const TestWrapper: React.FC<{ children: React.ReactNode; initialState?: any }> = ({
  children,
  initialState
}) => (
  <Provider store={createTestStore(initialState)}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
)

describe('ForgotPasswordForm Component', () => {
  it('renders forgot password form correctly', () => {
    render(
      <TestWrapper>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    expect(screen.getByText(/找回密码/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/邮箱地址/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /发送重置链接/i })).toBeInTheDocument()
    expect(screen.getByText(/返回登录/i)).toBeInTheDocument()
  })

  it('validates email field', async () => {
    render(
      <TestWrapper>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /发送重置链接/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请输入邮箱地址/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(
      <TestWrapper>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid email', async () => {
    render(
      <TestWrapper>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/邮箱地址/i)
    const submitButton = screen.getByRole('button', { name: /发送重置链接/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/请输入邮箱地址/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/请输入有效的邮箱地址/i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const initialState = { isLoading: true }

    render(
      <TestWrapper initialState={initialState}>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /发送重置链接/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/发送中.../i)).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    const initialState = {
      successMessage: '重置链接已发送到您的邮箱，请查收'
    }

    render(
      <TestWrapper initialState={initialState}>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/重置链接已发送到您的邮箱，请查收/i)).toBeInTheDocument()
    })
  })

  it('shows error message on submission failure', async () => {
    const initialState = {
      error: '该邮箱地址未注册'
    }

    render(
      <TestWrapper initialState={initialState}>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/该邮箱地址未注册/i)).toBeInTheDocument()
    })
  })

  it('navigates back to login page', () => {
    render(
      <TestWrapper>
        <ForgotPasswordForm />
      </TestWrapper>
    )

    const backButton = screen.getByText(/返回登录/i)
    fireEvent.click(backButton)

    // 这里应该检查路由是否改变
  })
})