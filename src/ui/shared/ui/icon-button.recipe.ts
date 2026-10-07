import { cva } from '@styled/css';

export const iconButtonRecipe = cva({
  base: {
    position: 'relative',
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    width: 'menuButton',
    height: 'menuButton',
    padding: 0,
    color: 'text',
    background: 'raised',
    border: '2px solid {colors.edge}',
    cursor: 'pointer',
    _hover: { color: 'coin', borderColor: 'coin' },
    _active: { transform: 'translateY(2px)' },
    _focusVisible: { outline: '2px solid {colors.ink}', outlineOffset: '2px' },
  },
});

export const iconBadgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '8px',
  height: '8px',
  background: 'coin',
  boxShadow: '0 0 0 2px {colors.ground}',
} as const;
