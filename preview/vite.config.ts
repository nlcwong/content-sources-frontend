import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  resolve: {
    alias: {
      'services': path.resolve(__dirname, '../src/services'),
      'components': path.resolve(__dirname, '../src/components'),
      'Pages': path.resolve(__dirname, '../src/Pages'),
      'Hooks': path.resolve(__dirname, '../src/Hooks'),
      'middleware': path.resolve(__dirname, '../src/middleware'),
    },
  },
});
