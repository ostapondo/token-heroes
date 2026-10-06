import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'frost-witch',
  name: 'Frost Witch',
  order: 8,
  role: 'striker',
  attack: 'spell',
  baseDamage: 10,
  baseHp: 14,
  attackInterval: 1.2,
  levelCostBase: 300,
  hireCost: 2_500_000,
  unlockAtTokens: 250_000_000,
  sprite: {
    rows: [
      '....d...',
      '...dd...',
      '...dd...',
      '.dddddd.',
      '..fggf.j',
      '..fggf.j',
      '..fddf..',
      '..diid..',
      '..diid..',
      '..diid..',
    ],
    fixed: { d: '#1f4f7a', f: '#e8f7ff', g: '#e7b48f', i: '#2a6f9e', j: '#bfeaff' },
  },
});
