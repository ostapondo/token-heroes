import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'crow',
  name: 'Crow',
  hpScale: 0.6,
  damageScale: 1.0,
  sprite: {
    rows: [
      '..aab.....',
      'haeab.....',
      '.aaaabb...',
      '..aaaabbb.',
      '..caaaabbb',
      '...aaaab..',
      '...h.h....',
      '..hh.hh...',
    ],
  },
});
