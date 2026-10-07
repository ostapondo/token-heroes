import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'spider',
  name: 'Spider',
  hpScale: 0.8,
  damageScale: 1.1,
  sprite: {
    rows: [
      '.xx....xx.',
      'x..x..x..x',
      'x.xaaaax.x',
      '.xaaccaax.',
      'x.aeaaea.x',
      'xxaaaaaaxx',
      'x..abba..x',
      'x........x',
    ],
  },
});
