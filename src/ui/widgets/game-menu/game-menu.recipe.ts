import { sva } from '@styled/css';

export const gameMenuRecipe = sva({
  slots: ['root', 'head', 'tabs', 'tab', 'body'],
  base: {
    root: {
      position: 'absolute',
      inset: 0,
      zIndex: 10,
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr)',
      background: 'panel',
    },
    head: {
      display: 'flex',
      alignItems: 'center',
      gap: '2.5',
      height: 'topBar',
      paddingInline: '3.5',
      // A shadow, not a border, so the head is as tall as the top bar and the close button
      // lands exactly where the menu button was.
      boxShadow: 'inset 0 -2px 0 {colors.edge}',
    },
    tabs: { display: 'flex', alignSelf: 'stretch', gap: '1', marginRight: 'auto' },
    tab: {
      alignSelf: 'stretch',
      paddingInline: '2',
      background: 'transparent',
      border: 'none',
      borderBottom: '3px solid transparent',
      color: 'textMuted',
      textStyle: 'heading',
      letterSpacing: '0.04em',
      cursor: 'pointer',
      _hover: { color: 'text' },
      _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '-2px' },
      '&[aria-selected=true]': { color: 'text', borderBottomColor: 'coin' },
    },
    body: { overflowY: 'auto', paddingInline: '3.5', paddingBlock: '3' },
  },
});
