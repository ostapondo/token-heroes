import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'eye',
  name: 'Watcher',
  hpScale: 0.7,
  damageScale: 1.2,
  sprite: {
    rows: [
      '...bbbb...',
      '..bccccb..',
      '.bceeccb..',
      '.bexxecb..',
      '.bceeccb..',
      '..bccccb..',
      '...bbbb...',
      '...a.a....',
      '..a...a...',
      '..........',
    ],
  },
});
