import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import optimizeImageHandler from './api/optimize-image'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  for (const [key, value] of Object.entries(env)) {
    process.env[key] ??= value
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-api-routes',
        configureServer(server) {
          server.middlewares.use('/api/optimize-image', (request, response) => {
            void optimizeImageHandler(request, response)
          })
        },
      },
    ],
  }
})
