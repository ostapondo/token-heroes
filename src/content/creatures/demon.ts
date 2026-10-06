import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'demon',
  name: 'Demon',
  attack: 'lunge',
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
