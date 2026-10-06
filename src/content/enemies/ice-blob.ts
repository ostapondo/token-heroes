import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'ice-blob',
  name: 'Ice Blob',
  element: 'ice',
  hpScale: 1.2,
  damageScale: 0.7,
  sprite: {
    rows: [
      '..........',
      '..........',
      '..........',
      '...aaaa...',
      '..acaaaa..',
      '.aaaaaaaa.',
      '.aaxaaxaa.',
      '.aaaaaaaa.',
      '.bbbbbbbb.',
      '..........',
    ],
  },
});
