import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'toad',
  name: 'Toad',
  hpScale: 1.2,
  damageScale: 0.7,
  sprite: {
    rows: [
      '.ee.......',
      'exea......',
      'aaaaaaa...',
      'xxxxaaaab.',
      'caaaaaaab.',
      '.cccaaaabb',
      '..b..b.bb.',
    ],
  },
});
