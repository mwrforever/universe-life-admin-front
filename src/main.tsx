import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { App as AntdApp } from 'antd'
import './styles/globals.css'
import './styles/theme-transition.css'
import './styles/search.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { store } from './store'
import App from './App.tsx'

console.log('🚀 开始加载万象生活后台管理系统...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ 找不到root元素')
  throw new Error('Root element not found')
}

console.log('✅ 找到root元素，开始React渲染...')

const reactRoot = createRoot(rootElement)
reactRoot.render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)

console.log('✅ React应用渲染完成')
console.log('✅ 设计系统已配置')