import { sva } from '@styled/css';

export const roleLineRecipe = sva({
  slots: ['root', 'role'],
  base: {
    root: { display: 'flex', flexWrap: 'wrap', columnGap: '1.5', textStyle: 'caption' },
    role: { fontWeight: '600' },
  },
  variants: {
    role: {
      striker: { role: { color: 'coin' } },
      healer: { role: { color: 'heal' } },
      tank: { role: { color: 'ultimate' } },
    },
  },
});
