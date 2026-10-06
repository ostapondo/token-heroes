import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'ice-blob',
  name: 'Ice Blob',
  element: ElementId.Ice,
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
