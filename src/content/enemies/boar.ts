import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'boar',
  name: 'Boar',
  hpScale: 1.4,
  damageScale: 0.9,
  sprite: {
    rows: [
      '...bbbbb..',
      '.aaaaaaab.',
      'aeaaaaaaab',
      'haaaaaaaab',
      'xcaaaaaab.',
      '.ccbbbbb..',
      '.a.a..a.a.',
      '.x.x..x.x.',
    ],
  },
});
