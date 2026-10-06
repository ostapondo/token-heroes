import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const layer = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  resolve: {
    alias: {
      '@engine': layer('./src/engine/index.ts'),
      '@content': layer('./src/content/index.ts'),
      '@render': layer('./src/render/index.ts'),
      '@platform': layer('./src/platform/index.ts'),
      '@i18n': layer('./src/i18n/index.ts'),
      '@balance': layer('./src/balance/index.ts'),
      '@styled': layer('./styled-system'),
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    target: 'es2023',
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
