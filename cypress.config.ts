import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'tests/e2e/**/*.spec.{ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    trashAssetsBeforeRuns: true,
      retries: {
      runMode: 2,
      openMode: 0,
    },
    env: {
      VITE_API_BASE_URL: 'http://localhost:5050/v1',
      VITE_SOCKET_URL: 'http://localhost:5050',
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})