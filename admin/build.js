#!/usr/bin/env node

// Custom build script to handle Rollup native module issues
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables to avoid native module issues
process.env.ROLLUP_NATIVE = 'false';
process.env.NODE_ENV = 'production';

console.log('🚀 Starting custom build process...');
console.log('📦 Setting ROLLUP_NATIVE=false to avoid native module issues');

try {
  // Run the build using esbuild directly if possible
  console.log('🔨 Running Vite build...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: __dirname,
    env: {
      ...process.env,
      ROLLUP_NATIVE: 'false',
      NODE_ENV: 'production'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 