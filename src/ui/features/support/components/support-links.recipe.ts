import { sva } from '@styled/css';

const textButton = {
  minHeight: 'touch',
  paddingInline: '1',
  background: 'transparent',
  border: 'none',
  textStyle: 'small',
  cursor: 'pointer',
  _hover: { textDecoration: 'underline' },
  _focusVisible: { outline: '2px solid {colors.ink}' },
  _disabled: { cursor: 'progress', textDecoration: 'none' },
} as const;

export const supportLinksRecipe = sva({
  slots: ['root', 'update', 'report'],
  base: {
    root: { display: 'flex', alignItems: 'center', gap: '1' },
    update: { ...textButton, color: 'coin' },
    report: { ...textButton, color: 'textMuted' },
  },
});
