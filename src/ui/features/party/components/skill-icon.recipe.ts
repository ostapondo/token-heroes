import { sva } from '@styled/css';

export const skillIconRecipe = sva({
  slots: ['root', 'image', 'rank', 'cover'],
  base: {
    root: {
      position: 'relative',
      width: '28px',
      height: '28px',
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      flexShrink: 0,
      _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '2px' },
    },
    image: { display: 'block', width: '28px', height: '28px', imageRendering: 'pixelated' },
    rank: {
      position: 'absolute',
      right: '-4px',
      bottom: '-5px',
      textStyle: 'tag',
      fontSize: '15px',
      color: 'ink',
      textShadow: '1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000',
      pointerEvents: 'none',
    },
    cover: {
      position: 'absolute',
      insetInline: 0,
      top: 0,
      background: 'rgba(13, 11, 9, 0.62)',
      pointerEvents: 'none',
    },
  },
  variants: {
    open: {
      true: { root: { outline: '2px solid {colors.coin}', outlineOffset: '1px' } },
      false: {},
    },
  },
});
