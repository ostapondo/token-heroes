import { sva } from '@styled/css';

export const burnChartRecipe = sva({
  slots: ['root', 'svg', 'legend', 'key', 'swatch'],
  base: {
    root: { display: 'grid', gap: '1.5' },
    svg: { display: 'block', width: '100%', height: 'auto', overflow: 'visible' },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: '3',
      rowGap: '1',
      textStyle: 'caption',
      color: 'textMuted',
    },
    key: { display: 'inline-flex', alignItems: 'center', gap: '1' },
    swatch: { width: '8px', height: '8px' },
  },
});
