import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      sentryVitePlugin({
        org: 'sidetool-4o',
        project: 'testpilot',
      }),
    ],

    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    define: {
      global: 'globalThis',
    },
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },

    build: {
      sourcemap: true,
    },

    // Add proxy for development to avoid CORS issues
    // vite.config.js
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080', // ← Local backend
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
