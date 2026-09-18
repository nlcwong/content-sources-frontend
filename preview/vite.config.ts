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
    // Specific stubs must win over broader path prefixes.
    alias: [
      {
        find: 'Hooks/useErrorNotification',
        replacement: path.resolve(stubsDir, 'useErrorNotification.ts'),
      },
      {
        find: 'Hooks/useNotification',
        replacement: path.resolve(stubsDir, 'useNotification.ts'),
      },
      {
        find: 'services/Lightwell/UserPreferencesQueries',
        replacement: path.resolve(stubsDir, 'UserPreferencesQueries.ts'),
      },
      {
        find: 'Pages',
        replacement: path.resolve(repoRoot, 'src/Pages'),
      },
      {
        find: 'services',
        replacement: path.resolve(repoRoot, 'src/services'),
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
