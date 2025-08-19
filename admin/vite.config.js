import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Force Rollup to use pure JavaScript implementation
process.env.ROLLUP_NATIVE = 'false'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Use esbuild instead of Rollup for bundling
    target: 'es2015',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      // Disable native modules
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  // Set environment variables to avoid native module issues
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.ROLLUP_NATIVE': 'false'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@rollup/rollup-linux-x64-gnu']
  }
})
