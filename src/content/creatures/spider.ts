import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'spider',
  name: 'Giant Spider',
  attack: 'spit',
  hpScale: 0.9,
  damageScale: 1.2,
  sprite: {
    rows: [
      '................',
      '................',
      '................',
      '........bbbbbbb.',
      '..xxx...bbbbbbb.',
      '.x......bbcccbb.',
      '.x..bebbbbbcbbb.',
      '.x..ebebbbbcbbb.',
      '.x..bbbbbbcccbb.',
      '.x..bbbbbbbbbbb.',
      '.x.xh.h.x...x.x.',
      '..x....x....x..x',
      '..x....x....x..x',
      '..x....x....x..x',
      '..x....x....x..x',
      '................',
    ],
  },
});
