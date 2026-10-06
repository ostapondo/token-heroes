import { sva } from '@styled/css';

export const arenaViewRecipe = sva({
  slots: ['root', 'canvas', 'strike'],
  base: {
    root: {
      position: 'relative',
      marginInline: '3',
      border: '2px solid {colors.border}',
      overflow: 'hidden',
    },
    canvas: { display: 'block', width: '100%', imageRendering: 'pixelated' },
    strike: {
      position: 'absolute',
      inset: 0,
      background: 'transparent',
      border: 'none',
      cursor: 'crosshair',
      _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '-4px' },
    },
  },
});
