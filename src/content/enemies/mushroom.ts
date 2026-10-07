import { defineEnemy } from '../model/definitions';

export default defineEnemy({
  id: 'mushroom',
  name: 'Sporeling',
  hpScale: 0.9,
  damageScale: 0.8,
  sprite: {
    rows: [
      '..aaaaa...',
      '.acaacaaa.',
      'aaaaaaaaab',
      '.bbbbbbbb.',
      '...hhhh...',
      '..ehhe.h..',
      '...hhhh...',
      '..hhhhhh..',
      '...h..h...',
    ],
  },
});
