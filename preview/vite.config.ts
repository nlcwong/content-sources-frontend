import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import previewPackage from './package.json';

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(previewDir, '..');
const previewNodeModules = path.resolve(previewDir, 'node_modules');

// Source files live under ../src, so Node's default resolution looks for
// node_modules at the repo root. CI only installs preview/node_modules.
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
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
