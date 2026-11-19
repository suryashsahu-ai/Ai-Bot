import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(frontendDir, '..')

export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, resolve(projectRoot, 'BotBackend'), '')
  const rootEnv = loadEnv(mode, projectRoot, '')
  const frontendEnv = loadEnv(mode, frontendDir, '')
  const env = { ...backendEnv, ...rootEnv, ...frontendEnv }
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY || `http://localhost:${env.PORT || 8000}`,
          changeOrigin: true
        }
      }
    }
  }
})
