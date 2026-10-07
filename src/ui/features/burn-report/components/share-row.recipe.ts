import { sva } from '@styled/css';

export const shareRowRecipe = sva({
  slots: ['root', 'chip', 'name', 'note', 'amount', 'share', 'meter'],
  base: {
    root: {
      display: 'grid',
      gridTemplateColumns: '10px minmax(0, 1fr) auto 40px',
      alignItems: 'center',
      columnGap: '2',
      rowGap: '1',
      fontVariantNumeric: 'tabular-nums',
    },
    chip: { width: '10px', height: '10px' },
    name: { minWidth: 0, textStyle: 'body', overflowWrap: 'anywhere' },
    note: { display: 'block', textStyle: 'caption', color: 'textMuted' },
    amount: { textStyle: 'body', textAlign: 'right' },
    share: { textStyle: 'caption', color: 'textMuted', textAlign: 'right' },
    meter: { gridColumn: '2 / -1' },
  },
  variants: {
    chipless: {
      true: {
        root: { gridTemplateColumns: 'minmax(0, 1fr) auto 40px' },
        meter: { gridColumn: '1 / -1' },
      },
    },
    untracked: {
      true: {
        chip: {
          background:
            'repeating-linear-gradient(135deg, {colors.inkDim} 0 2px, transparent 2px 4px)',
        },
      },
    },
  },
});
