import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.join(root, 'assets'),
      '@shared': path.join(root, 'shared'),
    },
  },
  server: {
    port: 5173,
    fs: { allow: [root] },
    proxy: { '/api': 'http://localhost:5000' },
  },
});
