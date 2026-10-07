import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'slime',
  name: 'Slime',
  hpScale: 1.2,
  damageScale: 0.7,
  sprite: {
    rows: [
      '....cc....',
      '...caaa...',
      '..caaaaa..',
      '.caeaaeaa.',
      '.aaaaaaaab',
      'aaaxxxaabb',
      'bbbbbbbbbb',
    ],
  },
});
