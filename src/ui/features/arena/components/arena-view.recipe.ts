import { sva } from '@styled/css';

export const arenaViewRecipe = sva({
  slots: ['root', 'canvas'],
  base: {
    root: {
      position: 'relative',
      marginInline: '3',
      border: '2px solid {colors.border}',
      overflow: 'hidden',
    },
    canvas: {
      display: 'block',
      width: '100%',
      touchAction: 'none',
      cursor: 'url(/cursors/sword.svg) 2 2, crosshair',
      _active: { cursor: 'url(/cursors/sword-strike.svg) 2 2, crosshair' },
      _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '-4px' },
    },
  },
});
