import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'knight',
  name: 'Skeleton Knight',
  attack: 'lunge',
  hpScale: 1.0,
  damageScale: 1.1,
  sprite: {
    rows: [
      '................',
      '.....cccccc.....',
      '...s.cccccc.....',
      '...s.cexcxe.....',
      '...s.cccccc.....',
      '...s.ccxcxc.....',
      '...s...cc.......',
      '...sccccccccbbb.',
      '...sc..cc..cbbb.',
      '..bbbcccccccbab.',
      '....c..cc..cbbb.',
      '......cccc..bbb.',
      '......c..c......',
      '......c..c......',
      '......c..c......',
      '.....cc..cc.....',
    ],
    fixed: { s: '#a9b3bf' },
  },
});
