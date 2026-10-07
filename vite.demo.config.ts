import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.ts';

// Builds the game for the Pages demo. Outside Tauri the platform layer picks the browser host,
// whose fake agent burns the tokens. Run after vite.site.config.ts, which empties dist-site.
export default mergeConfig(
  base,
  defineConfig({
    base: './',
    build: {
      outDir: 'dist-site/play/game',
      emptyOutDir: true,
    },
  }),
);
