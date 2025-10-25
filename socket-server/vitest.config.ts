import { defineConfig } from 'vitest/config'

export default defineConfig({
  testEnvironment: 'node',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'dist/',
      '**/*.config.*',
      '**/*.test.*',
      '**/*.spec.*'
    ],
  },
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.{js,ts}',
    '**/*.{test,spec}.{js,ts}'
  ],
  include: [
    'src/**/*.{js,ts}'
  ]
})