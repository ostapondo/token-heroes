import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'blood-wolf',
  name: 'Blood Wolf',
  element: ElementId.Blood,
  hpScale: 1.1,
  damageScale: 1.3,
  sprite: {
    rows: [
      '..........',
      '..........',
      '..bb......',
      'aaaa.....b',
      'aeaaaaaaab',
      'ccaaaaaaa.',
      '...aaaaaa.',
      '...b...b..',
      '...b...b..',
      '...b...b..',
    ],
  },
});
