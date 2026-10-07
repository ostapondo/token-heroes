import { css, sva } from '@styled/css';

export const partyListStyle = css({
  listStyle: 'none',
  margin: 0,
  padding: '3',
  display: 'grid',
  alignContent: 'start',
  gap: '1',
  overflowY: 'auto',
  flex: 1,
});

export const rowRecipe = sva({
  slots: ['root', 'body', 'header', 'name', 'skills', 'level', 'note', 'action'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '2.5',
      paddingInline: '2',
      paddingBlock: '1.5',
    },
    body: { flex: 1, display: 'grid', gap: '1' },
    header: { display: 'flex', alignItems: 'center', gap: '1.5', minHeight: '28px' },
    name: { textStyle: 'label' },
    skills: { display: 'inline-flex', gap: '1' },
    level: { textStyle: 'label', color: 'coin', marginLeft: 'auto' },
    note: { textStyle: 'caption', color: 'textMuted' },
    action: {},
  },
});
