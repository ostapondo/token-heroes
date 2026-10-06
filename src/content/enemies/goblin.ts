import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'goblin',
  name: 'Goblin',
  element: ElementId.Venom,
  hpScale: 1.0,
  damageScale: 1.0,
  sprite: {
    rows: [
      '...aaaa...',
      '..aeaeaa..',
      '...aaaa...',
      '.s.bbbb...',
      '.sabbbba..',
      '.sabbbba..',
      '...bbbb...',
      '...x..x...',
      '...x..x...',
      '...x..x...',
    ],
    fixed: { s: '#c9d1d9' },
  },
});
