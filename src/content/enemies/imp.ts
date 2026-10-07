import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'imp',
  name: 'Imp',
  hpScale: 0.8,
  damageScale: 1.2,
  sprite: {
    rows: [
      '..h..h....',
      '..haah....',
      '.baeaeb...',
      'bbaaaabb..',
      'bb.aaa.bb.',
      '...aca....',
      '...a.a..h.',
      '...a.a.h..',
      '..xx.xx...',
    ],
  },
});
