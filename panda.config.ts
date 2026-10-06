import { defineConfig } from '@pandacss/dev';
import { keyframes } from './src/ui/shared/theme/keyframes';
import { meter, panel, pixelButton } from './src/ui/shared/theme/recipes';
import { textStyles } from './src/ui/shared/theme/text-styles';
import { semanticTokens, tokens } from './src/ui/shared/theme/tokens';

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/preset-base'],
  include: ['./src/ui/**/*.{ts,tsx}'],
  exclude: ['./src/ui/**/*.test.ts'],
  outdir: 'styled-system',
  jsxFramework: 'react',
  theme: {
    extend: {
      tokens,
      semanticTokens,
      textStyles,
      keyframes,
      recipes: { pixelButton, panel },
      slotRecipes: { meter },
    },
  },
  globalCss: {
    'html, body': {
      margin: 0,
      background: 'ground',
      color: 'text',
      fontFamily: 'body',
      userSelect: 'none',
      overflow: 'hidden',
    },
    '::-webkit-scrollbar': { width: '1.5', height: '1.5' },
    '::-webkit-scrollbar-track': { background: 'ground' },
    '::-webkit-scrollbar-thumb': { background: 'edge', borderRadius: 0 },
    '::-webkit-scrollbar-thumb:hover': { background: 'inkDim' },
    '::-webkit-scrollbar-button': { display: 'none' },
    '::-webkit-scrollbar-corner': { background: 'ground' },
  },
});
