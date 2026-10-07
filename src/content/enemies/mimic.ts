import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'mimic',
  name: 'Mimic',
  hpScale: 1.2,
  damageScale: 1.2,
  sprite: {
    rows: [
      '.bbbbbbbb.',
      '.baaaaaab.',
      '.hhhhhhhh.',
      'h.h.h.h.h.',
      '.xxxexxxx.',
      '.baaaaaab.',
      '.bahhaaab.',
      '.bbbbbbbb.',
    ],
  },
});
