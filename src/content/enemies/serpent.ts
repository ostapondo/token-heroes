import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'serpent',
  name: 'Serpent',
  hpScale: 0.8,
  damageScale: 1.1,
  sprite: {
    rows: [
      '..aaa.....',
      '.aeaab....',
      'hxaab.....',
      '...ab.....',
      '...aab....',
      '..cab.....',
      '.caab.....',
      '.caaaab...',
      '..cbaaab..',
      '...bbbbbb.',
    ],
  },
});
