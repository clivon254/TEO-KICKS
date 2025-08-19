import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Force Rollup to use the pure JavaScript implementation
      // This avoids the native module loading issue on Linux
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    // Ensure we're using the right target
    target: 'es2015',
    // Disable source maps in production to avoid issues
    sourcemap: false
  },
  // Set environment variables to avoid native module issues
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
