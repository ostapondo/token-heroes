import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';

export default defineCreature({
  id: CreatureId.Golem,
  name: 'Golem',
  attack: CreatureAttack.Slam,
  hpScale: 1.6,
  damageScale: 0.8,
  sprite: {
    rows: [
      '.......cc.......',
      '.....aaaaaa.....',
      '..c..aeaaea..c..',
      '.cc..aaaaaa..cc.',
      '.ccaaaaaaaaaacc.',
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaeeaaaaaaa',
      'aaaaaaeaaaaaaaaa',
      'aaaaaaeaaeaaaaaa',
      'aaaaaaaaaeaaaaaa',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
    ],
  },
});
