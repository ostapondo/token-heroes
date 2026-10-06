import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';

export default defineCreature({
  id: CreatureId.Demon,
  name: 'Demon',
  attack: CreatureAttack.Lunge,
  hpScale: 1.1,
  damageScale: 1.3,
  sprite: {
    rows: [
      '................',
      '.hh..........hh.',
      '.hh..........hh.',
      '..hh........hh..',
      '..hh........hh..',
      'xxxaaaaaaaaaaxxx',
      'xbxabbbaabbbaxbx',
      'xbxaaeeaaeeaaxbx',
      'xbxaaaaaaaaaaxbx',
      'xbxaahxxxxhaaxbx',
      'xxxaahxxxxhaaxxx',
      '...bbxxxxxxbb...',
      '...bbbbbbbbbb...',
      '....bbb..bbb....',
      '....bbb..bbb....',
      '....bbb..bbb....',
    ],
  },
});
