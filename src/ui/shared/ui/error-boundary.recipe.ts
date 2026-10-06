import { sva } from '@styled/css';

export const errorBoundaryRecipe = sva({
  slots: ['root', 'title', 'detail'],
  base: {
    root: { display: 'grid', placeItems: 'center', gap: '3', padding: '6', textAlign: 'center' },
    title: { textStyle: 'title', margin: 0 },
    detail: { textStyle: 'body', color: 'textMuted', margin: 0 },
  },
});
