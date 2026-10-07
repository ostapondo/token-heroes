import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'armor',
  name: 'Hollow Armor',
  hpScale: 1.4,
  damageScale: 0.9,
  sprite: {
    rows: [
      '...hhh....',
      '..aaaaa...',
      '..axexa...',
      '..aaaaa...',
      '.cabbbac..',
      'hcabbbac..',
      'h.abbba...',
      'h..aaa....',
      '...a.a....',
      '..bb.bb...',
    ],
  },
});
