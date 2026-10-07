import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'orc',
  name: 'Orc',
  hpScale: 1.4,
  damageScale: 1.1,
  sprite: {
    rows: [
      '...aaaa...',
      '..aeaea...',
      '..ahhaa...',
      '.bbbbbbb..',
      'cabbbbbba.',
      'cabbbbbba.',
      'hh.bbbb.a.',
      'hh.b..b...',
      '...x..x...',
      '..xx..xx..',
    ],
  },
});
