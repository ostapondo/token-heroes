import { sva } from '@styled/css';

export const aboutPanelRecipe = sva({
  slots: ['root', 'title', 'version', 'text', 'note', 'actions'],
  base: {
    root: { display: 'grid', gap: '3', alignContent: 'start' },
    title: { margin: 0, textStyle: 'title' },
    version: { textStyle: 'caption', color: 'textMuted' },
    text: { margin: 0, textStyle: 'body' },
    note: { margin: 0, textStyle: 'small', color: 'textMuted' },
    actions: { display: 'grid', gap: '2', marginTop: '2' },
  },
});
