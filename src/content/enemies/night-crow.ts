import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'night-crow',
  name: 'Night Crow',
  element: ElementId.Shadow,
  hpScale: 0.6,
  damageScale: 1.0,
  sprite: {
    rows: [
      '..........',
      '..........',
      '..aeabbb..',
      'ccaaabbb..',
      '...aaaaabb',
      '...aaaaa..',
      '....h.h...',
      '....h.h...',
      '..........',
      '..........',
    ],
  },
});
