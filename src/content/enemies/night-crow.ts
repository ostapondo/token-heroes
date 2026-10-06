import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'night-crow',
  name: 'Night Crow',
  element: 'shadow',
  hpScale: 0.6,
  damageScale: 1.0,
  sprite: {
    rows: [
      '..........',
      '..........',
      '..aeabbb..',
      'ccaaabbb..',
      '...aaaaabb',
      '...aaaaa..',
      '....h.h...',
      '....h.h...',
      '..........',
      '..........',
    ],
  },
});
