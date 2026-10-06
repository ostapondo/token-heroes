import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.ts';

// Builds the balance tools for Node: the game's content is collected by import.meta.glob,
// which only Vite resolves. Silent, because the MCP server speaks over stdout.
export default mergeConfig(
  base,
  defineConfig({
    logLevel: 'silent',
    build: {
      ssr: true,
      outDir: 'dist-balance',
      emptyOutDir: true,
      rolldownOptions: {
        input: {
          'balance-mcp': 'scripts/balance-mcp.ts',
          'balance-report': 'scripts/balance-report.ts',
        },
        output: { entryFileNames: '[name].mjs' },
      },
    },
  }),
);
