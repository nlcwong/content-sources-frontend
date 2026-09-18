import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import previewPackage from './package.json';

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(previewDir, '..');
const previewNodeModules = path.resolve(previewDir, 'node_modules');
const stubsDir = path.resolve(previewDir, 'src/stubs');

const packageAliases = Object.keys(previewPackage.dependencies).reduce<Record<string, string>>(
  (aliases, dependency) => {
    aliases[dependency] = path.resolve(previewNodeModules, dependency);
    return aliases;
  },
  {},
);

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/content-sources-frontend/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      ...packageAliases,
      Pages: path.resolve(repoRoot, 'src/Pages'),
      services: path.resolve(repoRoot, 'src/services'),
      Hooks: path.resolve(repoRoot, 'src/Hooks'),
      'Hooks/useErrorNotification': path.resolve(stubsDir, 'useErrorNotification.ts'),
      'Hooks/useNotification': path.resolve(stubsDir, 'useNotification.ts'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
