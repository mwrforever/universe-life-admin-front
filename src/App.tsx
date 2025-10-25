/**
 * 万象生活后台管理系统 - 主应用组件
 */

import { useEffect } from 'react'
import AppRouter from './router'

function App() {
  useEffect(() => {
    console.log('🎯 App组件已挂载')
  }, [])

  return <AppRouter />
}

export default App