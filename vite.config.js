import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 3007,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/client-book-vue/api')
      },
      '/client-book-vue/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false
      },
      // 直接代理到PHP文件
      '/chat_groups.php': {
        target: 'http://localhost:80/client-book-vue/api',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: './index.html',
      output: {
        manualChunks: undefined
      }
    }
  }
})