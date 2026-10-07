import { sva } from '@styled/css';

export const bossBarRecipe = sva({
  slots: ['root', 'tag', 'panel', 'name', 'hp'],
  base: {
    root: {
      position: 'absolute',
      top: '2',
      insetInline: '2',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '3',
      pointerEvents: 'none',
      textShadow: '2px 2px 0 {colors.void}',
    },
    tag: { textStyle: 'tag', paddingInline: '1.5', background: 'void', color: 'var(--accent)' },
    panel: { width: 'bossPanel', display: 'grid', gap: '1', textAlign: 'right' },
    name: { textStyle: 'heading' },
    hp: { textStyle: 'small' },
  },
  variants: {
    superBoss: {
      true: { tag: { background: 'var(--accent)', color: 'void', textShadow: 'none' } },
      false: {},
    },
  },
});
