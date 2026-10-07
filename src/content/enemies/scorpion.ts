import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'scorpion',
  name: 'Scorpion',
  hpScale: 0.9,
  damageScale: 1.2,
  sprite: {
    rows: [
      '.......hh.',
      '........h.',
      '........a.',
      '.......aa.',
      'h.aaaaaa..',
      'hhaeaaab..',
      '.xaaaaab..',
      '.x.x.x.x..',
    ],
  },
});
