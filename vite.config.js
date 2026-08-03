import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/roblox-users': {
        target: 'https://users.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-users/, '')
      },
      '/roblox-thumbnails': {
        target: 'https://thumbnails.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-thumbnails/, '')
      },
      '/roblox-avatar-api': {
        target: 'https://avatar.roblox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/roblox-avatar-api/, '')
      },
      '/mlbb-check': {
        target: 'https://www.smile.one',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mlbb-check/, '')
      }
    }
  }
})
