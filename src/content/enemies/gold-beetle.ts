import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'gold-beetle',
  name: 'Gold Beetle',
  element: 'gold',
  hpScale: 1.6,
  damageScale: 0.6,
  sprite: {
    rows: [
      '..........',
      '...ebbe...',
      '..aaaxaa..',
      '.bacaxaab.',
      '..aaaxaa..',
      '.baaaxaab.',
      '..aaaxaa..',
      '..b....b..',
      '..........',
      '..........',
    ],
  },
});
