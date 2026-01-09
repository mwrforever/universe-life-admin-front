import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/context': path.resolve(__dirname, './src/context'),
    },
  },
  server: {
    allowedHosts: [
      "com.universe-life.back.front"
    ],
    port: 5000,
    host: true,
    proxy: {
      '/api/employee': {
        target: 'http://localhost:8099',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/oauth2': {
        target: 'http://localhost:8099',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8101',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 生产环境关闭 sourcemap 减小体积
    rollupOptions: {
      output: {
        // 更细粒度的代码分割策略
        manualChunks: (id) => {
          // node_modules 包分离
          if (id.includes('node_modules')) {
            // React 核心
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }

            // Ant Design 生态
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd';
            }

            // 路由
            if (id.includes('react-router')) {
              return 'router';
            }

            // Redux
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux';
            }

            // 图表库
            if (id.includes('@ant-design/plots') || id.includes('echarts')) {
              return 'charts';
            }

            // 其他第三方库
            return 'vendor';
          }

          // 业务代码分离
          if (id.includes('src/pages')) {
            return 'pages';
          }

          if (id.includes('src/components')) {
            return 'components';
          }

          if (id.includes('src/services')) {
            return 'services';
          }
        },
        // chunk 文件命名策略
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 提高 chunk 大小警告阈值（避免不必要的警告）
    chunkSizeWarningLimit: 1000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
