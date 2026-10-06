import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

export const tokens = defineTokens({
  colors: {
    ground: { value: '#0d0b09' },
    panel: { value: '#1a1612' },
    raised: { value: '#2a231c' },
    edge: { value: '#3b3128' },
    ink: { value: '#efe6d4' },
    inkDim: { value: '#a89a84' },
    coin: { value: '#e8b23a' },
    coinShade: { value: '#8a5e14' },
    coinInk: { value: '#1a1206' },
    ultimate: { value: '#9fd6ff' },
    ultimateShade: { value: '#4f8fb8' },
    ultimateInk: { value: '#08131c' },
    heal: { value: '#7cc35b' },
    wound: { value: '#ff5b4a' },
    void: { value: '#000000' },
  },
  fonts: {
    display: { value: "'Jersey 10', monospace" },
    body: { value: "'Pixelify Sans', sans-serif" },
  },
  spacing: {
    '0.5': { value: '2px' },
    '1': { value: '4px' },
    '1.5': { value: '6px' },
    '2': { value: '8px' },
    '2.5': { value: '10px' },
    '3': { value: '12px' },
    '3.5': { value: '14px' },
    '4': { value: '16px' },
    '6': { value: '24px' },
  },
  sizes: {
    window: { value: '400px' },
    touch: { value: '44px' },
    button: { value: '84px' },
    bossPanel: { value: '200px' },
  },
});

export const semanticTokens = defineSemanticTokens({
  colors: {
    surface: { value: '{colors.panel}' },
    border: { value: '{colors.edge}' },
    text: { value: '{colors.ink}' },
    textMuted: { value: '{colors.inkDim}' },
  },
});
