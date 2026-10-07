import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'wolf',
  name: 'Wolf',
  hpScale: 1.1,
  damageScale: 1.2,
  sprite: {
    rows: [
      '..h.......',
      '.ahh......',
      'aaea....b.',
      'xaaaaaaabb',
      '.caaaaaab.',
      '..cbbbbba.',
      '..a.a..a.a',
      '..a.a..a.a',
      '.xx.x.xx.x',
    ],
  },
});
