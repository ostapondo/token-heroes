import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'skull',
  name: 'Burning Skull',
  hpScale: 0.6,
  damageScale: 1.2,
  sprite: {
    rows: [
      '...e..e...',
      '..ece.ce..',
      '..ccccce..',
      '..hhhhh...',
      '.hhhhhhh..',
      '.hexhexh..',
      '.hhhxhhh..',
      '..hxhxh...',
      '..........',
      '..........',
    ],
  },
});
