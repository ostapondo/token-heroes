import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'ghost',
  name: 'Ghost',
  hpScale: 0.6,
  damageScale: 1.1,
  sprite: {
    rows: [
      '...cccc...',
      '..cccccca.',
      '.cecceccaa',
      '.cccccccaa',
      '.ccxxcccaa',
      'cccccccaa.',
      '.cccccca..',
      '.cc.cc.a..',
      '.c...c....',
      '..........',
    ],
  },
});
