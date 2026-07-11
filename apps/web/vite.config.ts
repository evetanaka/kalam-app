import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import path from 'path'

export default defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@kalam/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@kalam/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@kalam/stores': path.resolve(__dirname, '../../packages/stores/src'),
      '@kalam/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
})
