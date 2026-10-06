import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'gold-beetle',
  name: 'Gold Beetle',
  element: ElementId.Gold,
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
