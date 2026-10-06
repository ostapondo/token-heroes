import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'skeleton',
  name: 'Skeleton',
  element: 'bone',
  hpScale: 1.0,
  damageScale: 1.0,
  sprite: {
    rows: [
      '..ccccc...',
      '..cecxc...',
      '.bccccc...',
      '.b..c.....',
      '.b.ccc....',
      '.b..c.....',
      '.b.ccc....',
      '...c.c....',
      '...c.c....',
      '...c.c....',
    ],
  },
});
