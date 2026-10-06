import { sva } from '@styled/css';

export const ultimateBarRecipe = sva({
  slots: ['root', 'gauge', 'caption'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      paddingInline: '3',
      paddingTop: '2.5',
    },
    gauge: { flex: 1, display: 'grid', gap: '1' },
    caption: {
      display: 'flex',
      justifyContent: 'space-between',
      textStyle: 'small',
      color: 'textMuted',
    },
  },
});
