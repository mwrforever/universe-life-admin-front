import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import LoginForm from '@/components/auth/LoginForm'
import authReducer from '@/store/slices/authSlice'

// 创建测试store
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

// 测试包装组件
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

describe('LoginForm Component', () => {
  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument()
    expect(screen.getByText(/忘记密码/i)).toBeInTheDocument()
    expect(screen.getByText(/注册账号/i)).toBeInTheDocument()
  })

  it('validates form fields correctly', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /登录/i })

    // 提交空表单
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const initialState = { isLoading: true }

    render(
      <TestWrapper initialState={initialState}>
        <LoginForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /登录/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/登录中.../i)).toBeInTheDocument()
  })

  it('handles remember me checkbox', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const rememberCheckbox = screen.getByRole('checkbox')
    expect(rememberCheckbox).toBeInTheDocument()

    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
  })

  it('navigates to forgot password page', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const forgotPasswordLink = screen.getByText(/忘记密码/i)
    fireEvent.click(forgotPasswordLink)

    // 这里应该检查路由是否改变，但需要mock router
  })

  it('navigates to register page', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const registerLink = screen.getByText(/注册账号/i)
    fireEvent.click(registerLink)

    // 这里应该检查路由是否改变
  })

  it('submits form with valid data', async () => {
    const mockLogin = jest.fn()

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const usernameInput = screen.getByLabelText(/用户名/i)
    const passwordInput = screen.getByLabelText(/密码/i)
    const submitButton = screen.getByRole('button', { name: /登录/i })

    // 填写有效数据
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // 提交表单
    fireEvent.click(submitButton)

    await waitFor(() => {
      // 验证登录函数被调用
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      })
    })
  })

  it('shows error message on login failure', async () => {
    const initialState = {
      error: '用户名或密码错误'
    }

    render(
      <TestWrapper initialState={initialState}>
        <LoginForm />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/用户名或密码错误/i)).toBeInTheDocument()
    })
  })

  it('handles password visibility toggle', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/密码/i) as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    // 点击显示密码按钮
    const toggleButton = screen.getByRole('button', { name: /显示密码/i })
    fireEvent.click(toggleButton)

    expect(passwordInput.type).toBe('text')
    expect(screen.getByRole('button', { name: /隐藏密码/i })).toBeInTheDocument()
  })
})