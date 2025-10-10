import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
  server: {
    proxy: {
      '/api': {
        target: 'https://tespilot-api-301794542770.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
