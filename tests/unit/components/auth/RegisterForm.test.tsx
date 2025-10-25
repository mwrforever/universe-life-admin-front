import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import RegisterForm from '@/components/auth/RegisterForm'
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

describe('RegisterForm Component', () => {
  it('renders registration form correctly', () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/用户名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/手机号/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/确认密码/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/性别/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/年龄/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/地址/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /我已阅读并同意/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /注册/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /注册/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入邮箱/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入手机号/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      expect(screen.getByText(/请确认密码/i)).toBeInTheDocument()
      expect(screen.getByText(/请选择性别/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入年龄/i)).toBeInTheDocument()
      expect(screen.getByText(/请输入地址/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/邮箱/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument()
    })
  })

  it('validates phone number format', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const phoneInput = screen.getByLabelText(/手机号/i)
    fireEvent.change(phoneInput, { target: { value: '12345' } })

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的手机号/i)).toBeInTheDocument()
    })
  })

  it('validates password match', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/密码/i)
    const confirmPasswordInput = screen.getByLabelText(/确认密码/i)

    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } })

    await waitFor(() => {
      expect(screen.getByText(/两次输入的密码不一致/i)).toBeInTheDocument()
    })
  })

  it('validates age range', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const ageInput = screen.getByLabelText(/年龄/i)
    fireEvent.change(ageInput, { target: { value: '17' } })

    await waitFor(() => {
      expect(screen.getByText(/年龄必须在18到100之间/i)).toBeInTheDocument()
    })
  })

  it('requires agreement checkbox', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /注册/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请阅读并同意用户协议/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(
      <TestWrapper>
        <RegisterForm />
      </TestWrapper>
    )

    // 填写表单数据
    fireEvent.change(screen.getByLabelText(/用户名/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/邮箱/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/手机号/i), { target: { value: '13800138000' } })
    fireEvent.change(screen.getByLabelText(/密码/i), { target: { value: 'Password123!' } })
    fireEvent.change(screen.getByLabelText(/确认密码/i), { target: { value: 'Password123!' } })

    // 选择性别
    fireEvent.click(screen.getByText(/男/i))

    fireEvent.change(screen.getByLabelText(/年龄/i), { target: { value: '25' } })
    fireEvent.change(screen.getByLabelText(/地址/i), { target: { value: '北京市朝阳区' } })

    // 勾选同意协议
    fireEvent.click(screen.getByRole('checkbox', { name: /我已阅读并同意/i }))

    const submitButton = screen.getByRole('button', { name: /注册/i })
    fireEvent.click(submitButton)

    // 验证没有验证错误
    await waitFor(() => {
      expect(screen.queryByText(/请输入/)).not.toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const initialState = { isLoading: true }

    render(
      <TestWrapper initialState={initialState}>
        <RegisterForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /注册/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/注册中.../i)).toBeInTheDocument()
  })
})