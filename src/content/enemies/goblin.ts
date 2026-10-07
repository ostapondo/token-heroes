import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'goblin',
  name: 'Goblin',
  hpScale: 1.0,
  damageScale: 1.0,
  sprite: {
    rows: [
      'h..aaa....',
      'h.aeaea...',
      'h..aaa....',
      'h.bbbbb...',
      'hcabbbab..',
      'h.abbba...',
      'h..bbb....',
      'h..x.x....',
      'h..x.x....',
      'h.xx.xx...',
    ],
  },
});
