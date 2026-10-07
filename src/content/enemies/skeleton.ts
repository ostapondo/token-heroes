import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'skeleton',
  name: 'Skeleton',
  hpScale: 1.0,
  damageScale: 1.0,
  sprite: {
    rows: [
      '....hhh...',
      '...hehxh..',
      '....hhh..c',
      '..bbhxh.c.',
      '.baahhh.c.',
      '.bab.h.h..',
      '.baahhh...',
      '..bb.h....',
      '....h.h...',
      '...hh.hh..',
    ],
  },
});
