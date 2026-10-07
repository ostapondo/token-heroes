import { defineConfig } from 'vite';

// Builds the GitHub Pages site. The base is relative because Pages serves it under
// /token-heroes/; the art comes from docs/readme, so the site and the README never drift.
export default defineConfig({
  root: 'site',
  base: './',
  publicDir: false,
  clearScreen: false,
  server: { fs: { allow: ['..'] } },
  build: {
    target: 'es2023',
    outDir: '../dist-site',
    emptyOutDir: true,
  },
});
