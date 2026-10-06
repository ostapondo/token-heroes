import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'wraith',
  name: 'Wraith',
  attack: 'scythe',
  hpScale: 0.8,
  damageScale: 1.4,
  sprite: {
    rows: [
      '................',
      '.ssssbbbbbb.....',
      '.w...bbbbbb.....',
      '.w..abvvvvbb....',
      '.w..abevvebb....',
      '.w..abvvvvbb....',
      '.w.aabbbbbbbb...',
      '.whhabbbbbbbb...',
      '.w.aabbbbbbbb...',
      '.w.aabbbbbbbb...',
      '.w.aabbbbbbbb...',
      '.w.aabbbbbbbb...',
      '.w.bb.bb.bb.b...',
      '.w.bb.bb.bb.b...',
      '.w....bb....b...',
      '................',
    ],
    fixed: { s: '#c9d1d9', v: '#050808', w: '#6b4a2e' },
  },
});
