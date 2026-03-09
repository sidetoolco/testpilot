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

    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://testpilot-be.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          timeout: 60000,
          configure: (proxy) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('[vite proxy]', err.message);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                console.error('[vite proxy]', req.url, '->', proxyRes.statusCode);
              }
            });
          },
        },
      },
    },
  };
});
