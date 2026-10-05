import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import previewPackage from './package.json';

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(previewDir, '..');
const srcRoot = path.resolve(repoRoot, 'src');
const previewNodeModules = path.resolve(previewDir, 'node_modules');
const stubsDir = path.resolve(previewDir, 'src/stubs');

const packageAliases = Object.keys(previewPackage.dependencies).reduce<Record<string, string>>(
  (aliases, dependency) => {
    // Prefer preview node_modules so PatternFly/React stay singletons.
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
        // Relative imports of LightwellPageHeader (e.g. from Beacon.tsx) bypass package aliases.
        find: path.resolve(srcRoot, 'Pages/Lightwell/components/LightwellPageHeader.tsx'),
        replacement: path.resolve(stubsDir, 'LightwellPageHeader.tsx'),
      },
      {
        find: 'Pages/Lightwell/constants',
        replacement: path.resolve(stubsDir, 'lightwellConstants.ts'),
      },
      {
        find: '@redhat-cloud-services/frontend-components/useChrome',
        replacement: path.resolve(stubsDir, 'useChrome.ts'),
      },
      {
        find: '@redhat-cloud-services/frontend-components',
        replacement: path.resolve(stubsDir, 'frontendComponents.tsx'),
      },
      {
        find: '@redhat-cloud-services/types',
        replacement: path.resolve(stubsDir, 'rhcsTypes.ts'),
      },
      {
        find: '@scalprum/react-core',
        replacement: path.resolve(stubsDir, 'scalprumReactCore.ts'),
      },
      {
        find: '@unleash/proxy-client-react',
        replacement: path.resolve(stubsDir, 'unleashProxyClientReact.ts'),
      },
      {
        find: 'Hooks/useNotification',
        replacement: path.resolve(stubsDir, 'useNotification.ts'),
      },
      {
        find: 'Hooks/useErrorNotification',
        replacement: path.resolve(stubsDir, 'useErrorNotification.ts'),
      },
      {
        find: 'Hooks/Lightwell/navigation/useLightwellRootPath',
        replacement: path.resolve(stubsDir, 'useLightwellRootPath.ts'),
      },
      {
        find: path.resolve(srcRoot, 'Hooks/Lightwell/navigation/useLightwellRootPath.ts'),
        replacement: path.resolve(stubsDir, 'useLightwellRootPath.ts'),
      },
      {
        find: 'Hooks',
        replacement: path.resolve(srcRoot, 'Hooks'),
      },
      {
        find: 'services',
        replacement: path.resolve(srcRoot, 'services'),
      },
      {
        find: 'helpers',
        replacement: path.resolve(srcRoot, 'helpers.ts'),
      },
      {
        find: 'Pages',
        replacement: path.resolve(srcRoot, 'Pages'),
      },
      ...Object.entries(packageAliases).map(([find, replacement]) => ({ find, replacement })),
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Silence legacy Sass warnings from PatternFly/app styles in preview.
        quietDeps: true,
      },
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
});
