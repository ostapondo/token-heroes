import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'cultist',
  name: 'Cultist',
  hpScale: 0.7,
  damageScale: 1.3,
  sprite: {
    rows: [
      '....bb....',
      '...baab...',
      '..baxeab..',
      '..baxxab..',
      '.cbaaaab..',
      'e.baaaab..',
      '..baaaab..',
      '..baaaaab.',
      '.baaaaaab.',
      '.bab.bab..',
    ],
  },
});
