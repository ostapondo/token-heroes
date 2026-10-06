import { sva } from '@styled/css';

export const wipeOverlayRecipe = sva({
  slots: ['root', 'title', 'detail', 'countdown'],
  base: {
    root: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeContent: 'center',
      justifyItems: 'center',
      gap: '1',
      background: 'rgba(0, 0, 0, 0.45)',
      textShadow: '3px 3px 0 {colors.void}',
      pointerEvents: 'none',
    },
    title: { textStyle: 'banner', color: 'wound' },
    detail: { textStyle: 'body' },
    countdown: { textStyle: 'countdown' },
  },
});
