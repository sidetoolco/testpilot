import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/webhook-test': {
        target: 'https://sidetool.app.n8n.cloud/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook-test/, '/webhook')
      }
    }
  }
});
