import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'bat',
  name: 'Bat',
  hpScale: 0.6,
  damageScale: 0.8,
  sprite: {
    rows: [
      '..h....h..',
      '.bah..hab.',
      'bbaaaaaabb',
      'bbeaaeaabb',
      'b.aaaaaa.b',
      '...ahha...',
      '....aa....',
      '..........',
      '..........',
    ],
  },
});
