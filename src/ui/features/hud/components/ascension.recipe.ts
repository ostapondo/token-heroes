import { sva } from '@styled/css';

export const ascensionRecipe = sva({
  slots: ['root', 'power', 'open', 'dialog', 'title', 'body', 'change', 'actions'],
  base: {
    root: { display: 'flex', alignItems: 'center', gap: '2' },
    power: { textStyle: 'caption', color: 'ultimate' },
    open: {
      paddingInline: '2',
      paddingBlock: '0.5',
      background: 'transparent',
      border: '2px solid {colors.ultimate}',
      color: 'ultimate',
      textStyle: 'caption',
      cursor: 'pointer',
      _hover: { background: 'raised' },
      _focusVisible: { outline: '2px solid {colors.ink}' },
    },
    dialog: {
      margin: 'auto',
      width: 'min(320px, 90vw)',
      padding: '4',
      background: 'panel',
      color: 'text',
      border: '2px solid {colors.ultimate}',
      '&::backdrop': { background: 'rgba(0, 0, 0, 0.6)' },
    },
    title: { margin: 0, textStyle: 'title' },
    body: { marginBlock: '2', textStyle: 'body', color: 'textMuted' },
    change: { textStyle: 'heading', color: 'ultimate' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '2', marginTop: '3' },
  },
});
