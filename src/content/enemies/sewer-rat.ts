import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'sewer-rat',
  name: 'Sewer Rat',
  element: ElementId.Earth,
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
