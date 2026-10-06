import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'frost-spirit',
  name: 'Frost Spirit',
  element: ElementId.Ice,
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
