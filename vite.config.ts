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
        target: 'http://com.universe-life.auth.server',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api': {
        target: 'http://com.universe-life.gateway.server',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://com.universe-life.auth.server',
        changeOrigin: true,
      },
      '/userinfo': {
        target: 'http://com.universe-life.auth.server',
        changeOrigin: true,
      },
      '/connect': {
        target: 'http://com.universe-life.auth.server',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://com.universe-life.auth.server',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
