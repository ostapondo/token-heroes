import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'golemite',
  name: 'Golemite',
  hpScale: 1.6,
  damageScale: 0.7,
  sprite: {
    rows: [
      '...bbbb...',
      '..baaaab..',
      '..aeaaab..',
      '.bbaaaabb.',
      'bcaaaaaaab',
      'bcaabbaaab',
      '.bbaaaabb.',
      '..ba..ab..',
      '.bba..abb.',
    ],
  },
});
