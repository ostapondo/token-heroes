import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'rat',
  name: 'Rat',
  hpScale: 0.5,
  damageScale: 0.6,
  sprite: {
    rows: [
      '...cc.....',
      '..cbbaaa..',
      '.aeaaaaaab',
      'xaaaaaaaab',
      '.ccaaaaab.',
      '..a.a.ab.h',
      '..x.x.xhh.',
    ],
  },
});
