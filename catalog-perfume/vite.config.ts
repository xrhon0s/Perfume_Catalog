import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import optimizeImageHandler from './api/optimize-image'

// https://vite.dev/config/
export default defineConfig({
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
})
