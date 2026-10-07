import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'beetle',
  name: 'Beetle',
  hpScale: 1.6,
  damageScale: 0.6,
  sprite: {
    rows: [
      'h.........',
      'hh..aaa...',
      '.h.acccab.',
      'xxaaacaaab',
      'exaaaaaaab',
      '.xbbbbbbb.',
      '..x.x.x.x.',
    ],
  },
});
