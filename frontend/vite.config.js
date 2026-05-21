import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    define: {
      // Make env vars available — Vite exposes VITE_* automatically,
      // this just ensures the build replaces them correctly
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Split large vendor chunks so Vercel serves them faster
          manualChunks: {
            vendor:   ['react', 'react-dom', 'react-router-dom'],
            framer:   ['framer-motion'],
            charts:   ['recharts'],
            katex:    ['katex'],
          },
        },
      },
    },
  }
})
