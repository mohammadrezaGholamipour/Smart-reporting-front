import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_URL || 'https://smart-reporting.vercel.app'

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // در حالت توسعه درخواست‌های /api به بک‌اند پروکسی می‌شوند؛ نیازی به CORS نیست.
      proxy: {
        '/api': { target: backend, changeOrigin: true, timeout: 0, proxyTimeout: 0 },
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            echarts: ['echarts', 'vue-echarts'],
            vendor: ['vue', 'vue-router', 'pinia', 'axios'],
          },
        },
      },
    },
  }
})
