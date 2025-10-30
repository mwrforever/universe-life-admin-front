/**
 * 主题切换工具函数
 */

// 清理所有内联样式和CSS变量
export const cleanThemeStyles = () => {
  // 清理documentElement的内联样式
  const element = document.documentElement
  const computedStyle = getComputedStyle(element)

  // 获取所有CSS自定义属性
  const cssVariables = Object.keys(computedStyle).filter(property =>
    property.startsWith('--') &&
    (property.includes('wan-') || property.includes('search-'))
  )

  // 清理所有自定义CSS变量
  cssVariables.forEach(variable => {
    element.style.removeProperty(variable)
  })

  // 清理body的内联样式
  document.body.style.removeProperty('color')
  document.body.style.removeProperty('background-color')
  document.body.style.removeProperty('font-family')
  document.body.style.removeProperty('font-size')

  // 清理可能存在的全局样式
  if (window.getComputedStyle) {
    const bodyStyle = getComputedStyle(document.body)
    const bodyProperties = ['color', 'background-color', 'background']
    bodyProperties.forEach(prop => {
      if (bodyStyle[prop] && bodyStyle[prop].includes('rgb')) {
        document.body.style.removeProperty(prop)
      }
    })
  }
}

// 强制重新计算所有样式
export const forceStyleRecalculation = () => {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      // 方法1：临时修改display属性
      document.documentElement.style.display = 'none'
      document.documentElement.offsetHeight // 强制重排

      requestAnimationFrame(() => {
        document.documentElement.style.display = ''
        document.documentElement.offsetHeight // 再次强制重排

        requestAnimationFrame(() => {
          // 方法2：临时添加class触发重绘
          document.documentElement.classList.add('theme-updating')
          document.documentElement.offsetHeight

          requestAnimationFrame(() => {
            document.documentElement.classList.remove('theme-updating')
            resolve()
          })
        })
      })
    })
  })
}

// 优化的主题切换函数
export const performThemeSwitch = async (themeMode: 'light' | 'dark') => {
  try {
    // 1. 创建过渡遮罩
    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'
    document.body.appendChild(overlay)

    // 2. 显示遮罩
    requestAnimationFrame(() => {
      overlay.classList.add('active')
    })

    // 3. 等待遮罩显示动画
    await new Promise(resolve => setTimeout(resolve, 150))

    // 4. 清理现有样式
    cleanThemeStyles()

    // 5. 设置新主题属性
    document.documentElement.setAttribute('data-theme', themeMode)

    // 6. 保存到localStorage
    localStorage.setItem('theme-mode', themeMode)

    // 7. 强制重新计算样式
    await forceStyleRecalculation()

    // 8. 隐藏遮罩
    requestAnimationFrame(() => {
      overlay.classList.remove('active')
    })

    // 9. 等待遮罩隐藏动画后移除
    await new Promise(resolve => setTimeout(resolve, 150))
    document.body.removeChild(overlay)

    // 10. 验证主题是否正确应用
    const appliedTheme = document.documentElement.getAttribute('data-theme')
    if (appliedTheme !== themeMode) {
      console.warn(`主题切换可能未完全生效，期望: ${themeMode}, 实际: ${appliedTheme}`)
      // 重试一次
      document.documentElement.setAttribute('data-theme', themeMode)
    }

  } catch (error) {
    console.error('主题切换失败:', error)
    // 降级处理：直接设置属性
    document.documentElement.setAttribute('data-theme', themeMode)
    localStorage.setItem('theme-mode', themeMode)

    // 清理可能残留的遮罩
    const overlay = document.querySelector('.theme-transition-overlay')
    if (overlay) {
      document.body.removeChild(overlay)
    }
  }
}

// 检查当前主题状态
export const getCurrentTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
  const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null

  // 优先使用localStorage中的值，其次使用当前DOM属性
  return savedTheme || currentTheme || 'light'
}

// 主题切换状态监听器
export const createThemeChangeListener = (_callback: (theme: 'light' | 'dark') => void) => {
  // 监听localStorage变化
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'theme-mode' && e.newValue) {
      _callback(e.newValue as 'light' | 'dark')
    }
  }

  // 监听DOM属性变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'data-theme' &&
        document.documentElement.getAttribute('data-theme')
      ) {
        const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark'
        _callback(newTheme)
      }
    })
  })

  // 开始监听
  window.addEventListener('storage', handleStorageChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })

  // 返回清理函数
  return () => {
    window.removeEventListener('storage', handleStorageChange)
    observer.disconnect()
  }
}