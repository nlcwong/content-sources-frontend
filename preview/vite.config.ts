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
    alias: [
      {
        find: 'Pages/Lightwell/components/LightwellPageHeader',
        replacement: path.resolve(stubsDir, 'LightwellPageHeader.tsx'),
      },
      {
        find: 'Pages',
        replacement: path.resolve(repoRoot, 'src/Pages'),
      },
      ...Object.entries(packageAliases).map(([find, replacement]) => ({ find, replacement })),
    ],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
