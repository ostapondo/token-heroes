import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'zombie',
  name: 'Zombie Brute',
  attack: 'slam',
  hpScale: 1.2,
  damageScale: 0.9,
  sprite: {
    rows: [
      '................',
      '.....xxxxx......',
      '.....xaaaa......',
      '.....aeaea......',
      '.....aaaaa......',
      '.....axxxa......',
      '.....ttttt......',
      'baaaattttt......',
      '......attt......',
      'baaaattttt......',
      '.....ttttt......',
      '.....ppppp......',
      '.....ppppp......',
      '.....pp.pp......',
      '.....pp.pp......',
      '....xxx.xxx.....',
    ],
    fixed: { p: '#3d3a2e', t: '#5a6b7a' },
  },
});
