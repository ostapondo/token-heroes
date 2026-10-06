import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'storm-eye',
  name: 'Storm Eye',
  element: 'storm',
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
