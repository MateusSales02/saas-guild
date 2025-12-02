import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/main.ts',
        'src/**/*.d.ts',
        'src/**/*.spec.ts',
        'src/pages/dashboard/Builds.vue',
        'src/pages/dashboard/Market.vue',
        'src/pages/dashboard/Members.vue',
        'src/pages/dashboard/Events.vue',
        'src/pages/dashboard/Raids.vue',
        'src/pages/dashboard/Treasury.vue',
        'src/pages/dashboard/Items.vue',
        'src/pages/dashboard/Items-backup.vue',
        'src/pages/dashboard/Items-test.vue',
        'src/pages/dashboard/Modal-backup.vue',
        'src/layouts/DashboardLayout.vue',
        'src/router/index.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 25,
        branches: 80,
        statements: 50,
      },
    },
  },
})
