import { sva } from '@styled/css';

export const partyBarRecipe = sva({
  slots: ['root', 'hp'],
  base: {
    root: {
      position: 'absolute',
      left: '3.5',
      bottom: '1',
      display: 'grid',
      gridTemplateColumns: 'token(sizes.partyPanel) auto',
      alignItems: 'end',
      gap: '1.5',
      pointerEvents: 'none',
      textShadow: '2px 2px 0 {colors.void}',
    },
    hp: { textStyle: 'caption', lineHeight: '1' },
  },
});
