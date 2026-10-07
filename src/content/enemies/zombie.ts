import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'zombie',
  name: 'Zombie',
  hpScale: 1.3,
  damageScale: 0.8,
  sprite: {
    rows: [
      '...aaa....',
      '..aexaa...',
      '...aaab...',
      'aaabbbb...',
      '...bbbbb..',
      '...bcbbb..',
      '...bbbb...',
      '...x..x...',
      '...x..x...',
      '..xx.xx...',
    ],
  },
});
