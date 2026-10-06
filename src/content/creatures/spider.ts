import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';

export default defineCreature({
  id: CreatureId.Spider,
  name: 'Giant Spider',
  attack: CreatureAttack.Spit,
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
