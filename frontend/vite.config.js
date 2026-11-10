import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React dev server proxies /api requests to the Express
// backend, so the frontend can use relative URLs (no CORS issues).
const apiProxy = {
  '/api': {
    target: process.env.API_URL || 'http://localhost:5000',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: apiProxy,
    // Allow the hosted preview domain (e.g. <port>-<id>.e2b.app) in addition to localhost
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    proxy: apiProxy,
    allowedHosts: true,
  },
});
