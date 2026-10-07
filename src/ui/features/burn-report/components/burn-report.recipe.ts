import { sva } from '@styled/css';

export const burnReportRecipe = sva({
  slots: ['root', 'ranges', 'range', 'headline', 'big', 'sub', 'block', 'heading', 'note'],
  base: {
    root: { display: 'grid', gap: '4', alignContent: 'start' },
    ranges: { display: 'flex', gap: '1.5' },
    range: {
      paddingInline: '2.5',
      paddingBlock: '0.5',
      background: 'raised',
      border: '2px solid {colors.edge}',
      color: 'textMuted',
      textStyle: 'small',
      cursor: 'pointer',
      _hover: { color: 'text' },
      _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '2px' },
      '&[aria-pressed=true]': { color: 'text', borderColor: 'coin' },
    },
    headline: { display: 'grid', gap: '0.5' },
    big: { textStyle: 'banner', color: 'coin', fontVariantNumeric: 'tabular-nums' },
    sub: { textStyle: 'caption', color: 'textMuted' },
    block: { display: 'grid', gap: '2' },
    heading: {
      margin: 0,
      textStyle: 'tag',
      color: 'textMuted',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    note: { textStyle: 'caption', color: 'textMuted' },
  },
});
