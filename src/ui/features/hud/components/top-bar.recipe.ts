import { sva } from '@styled/css';

export const topBarRecipe = sva({
  slots: ['root', 'stage', 'purse', 'wallet', 'income', 'burned'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: '3.5',
      paddingBlock: '2.5',
    },
    stage: { textStyle: 'title' },
    purse: { display: 'grid', justifyItems: 'end', gap: '0.5' },
    wallet: { display: 'flex', alignItems: 'center', gap: '2', textStyle: 'label' },
    burned: { textStyle: 'caption', color: 'textMuted' },
    income: { textStyle: 'tag', color: 'coin', animation: 'incomePop 1.6s ease-out forwards' },
  },
});
