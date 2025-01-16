import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/webhook-test': {
        target: 'https://sidetool.app.n8n.cloud/',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook-test/, '/webhook'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('origin', 'https://sidetool.app.n8n.cloud');
          });
        }
      }
    }
  }
});
