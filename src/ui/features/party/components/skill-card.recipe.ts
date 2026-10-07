import { sva } from '@styled/css';

export const skillCardRecipe = sva({
  slots: ['root', 'title', 'rhythm', 'facts', 'next'],
  base: {
    root: {
      display: 'grid',
      gap: '1',
      paddingBlock: '1.5',
      paddingInline: '2',
      background: 'raised',
      borderLeft: '2px solid var(--skill-color)',
    },
    title: { textStyle: 'label', color: 'var(--skill-color)' },
    rhythm: { textStyle: 'caption', color: 'textMuted' },
    facts: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'grid',
      gap: '0.5',
      textStyle: 'small',
    },
    next: { textStyle: 'caption', color: 'textMuted' },
  },
});
