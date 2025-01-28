import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const tsconfigPaths = await import('vite-tsconfig-paths')
  return {
    plugins: [tsconfigPaths.default()],
    test: {
      include: ['**/*.e2e-spec.ts'],
      globals: true,
      root: './',
      setupFiles: ['./test/setup-e2e.ts'],
      testEnvironment: 'node',
    },
  }
})
