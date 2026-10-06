import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'sewer-rat',
  name: 'Sewer Rat',
  element: 'earth',
  hpScale: 0.5,
  damageScale: 0.6,
  sprite: {
    rows: [
      '..........',
      '..........',
      '..........',
      '..........',
      '..b.......',
      'aaaaaaaa.c',
      'aeaaaaaacc',
      'xaaaaaaa..',
      '...b..b...',
      '..........',
    ],
  },
});
