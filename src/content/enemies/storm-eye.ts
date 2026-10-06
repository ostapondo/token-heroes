import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'storm-eye',
  name: 'Storm Eye',
  element: ElementId.Storm,
  hpScale: 0.8,
  damageScale: 1.2,
  sprite: {
    rows: [
      '..........',
      '...hhhh...',
      '..hhhhhh..',
      '..ehaaah..',
      '..hhaxah..',
      '..hhaaah..',
      '..hhhhhe..',
      '...hhhh...',
      '...b.b.b..',
      '...b...b..',
    ],
  },
});
