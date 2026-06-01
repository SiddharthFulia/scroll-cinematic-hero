import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'examples/basic'),
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      'scroll-cinematic-hero': resolve(__dirname, 'src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: __dirname,
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: [resolve(__dirname, 'tests/setup.ts')],
  },
});
