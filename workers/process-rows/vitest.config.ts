// import tsConfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'
export default defineConfig(async () => {
  return {
    plugins: [(await import('vite-tsconfig-paths')).default()],
    test: {
      globals: true,
      root: './',
      mockReset: true,
      exclude: [
        ...configDefaults.exclude,
        '**/node_modules/**',
        '**/dist/**',
        './src/config/**',
        './src/error/**',
        './src/types/**',
        '**/interface.ts',
      ],
      coverage: {
        exclude: [
          '**/*.config.ts', // Arquivos de configuração
          '**/*.d.ts', // Arquivos de definição de tipos
          '**/interface.ts', // Exclui qualquer arquivo chamado "interface.ts"
          './src/config/**', // Diretório de configurações
          './src/error/**', // Diretório de erros
          './src/types/**', // Diretório de tipos
        ],
      },
    },
  }
})
