import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(previewDir, '..');

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/content-sources-frontend/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      Pages: path.resolve(repoRoot, 'src/Pages'),
      services: path.resolve(repoRoot, 'src/services'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
