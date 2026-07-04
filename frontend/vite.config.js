import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/users': { target: 'http://localhost:3002', changeOrigin: true },
      '/api/products': { target: 'http://localhost:3003', changeOrigin: true },
      '/api/orders': { target: 'http://localhost:3004', changeOrigin: true },
    }
  }
})
