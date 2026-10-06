import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'sporeling',
  name: 'Sporeling',
  element: ElementId.Earth,
  hpScale: 0.9,
  damageScale: 0.8,
  sprite: {
    rows: [
      '..........',
      '..aaaaaa..',
      '.aacaacaa.',
      '.aaaaaaaa.',
      '...hhhh...',
      '...xhxh...',
      '...hhhh...',
      '...hhhh...',
      '...b..b...',
      '..........',
    ],
  },
});
