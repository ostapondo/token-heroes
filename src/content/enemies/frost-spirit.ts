import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'frost-spirit',
  name: 'Frost Spirit',
  element: 'ice',
  hpScale: 0.7,
  damageScale: 1.1,
  sprite: {
    rows: [
      '..........',
      '...cccc...',
      '..cccccc..',
      '..cccccc..',
      '..cxccxc..',
      '..cxccxc..',
      '..ccaacc..',
      '..cccccc..',
      '..c.cc.c..',
      '..........',
    ],
  },
});
