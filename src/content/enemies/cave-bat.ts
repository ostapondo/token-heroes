import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'cave-bat',
  name: 'Cave Bat',
  element: 'shadow',
  hpScale: 0.6,
  damageScale: 0.8,
  sprite: {
    rows: [
      '..........',
      '...a..a...',
      'bbbaaaabbb',
      'bbbeaaebbb',
      'b..aaaa..b',
      '...axxa...',
      '..........',
      '..........',
      '..........',
      '..........',
    ],
  },
});
