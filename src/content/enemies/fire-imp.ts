import { defineEnemy } from '../model/definitions';
import { ElementId } from '../model/ids';

export default defineEnemy({
  id: 'fire-imp',
  name: 'Fire Imp',
  element: ElementId.Fire,
  hpScale: 0.8,
  damageScale: 1.2,
  sprite: {
    rows: [
      '..........',
      '...h...h..',
      '...h...h..',
      '.bbaaaaabb',
      '.bbaeaeabb',
      '...aaaaa..',
      '...aaaaac.',
      '....b.b..c',
      '....b.b...',
      '..........',
    ],
  },
});
