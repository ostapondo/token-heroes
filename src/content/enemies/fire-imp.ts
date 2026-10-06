import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'fire-imp',
  name: 'Fire Imp',
  element: 'fire',
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
