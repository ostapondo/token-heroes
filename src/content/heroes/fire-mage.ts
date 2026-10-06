import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'fire-mage',
  name: 'Fire Mage',
  order: 5,
  role: 'striker',
  attack: 'spell',
  baseDamage: 9,
  baseHp: 12,
  attackInterval: 2.0,
  levelCostBase: 120,
  hireCost: 140_000,
  unlockAtTokens: 0,
  sprite: {
    rows: [
      '...r....',
      '..rrr...',
      '..rrr...',
      '.rrrrrr.',
      '..ddd...',
      '..rffrij',
      '..rffrii',
      '..rrrr..',
      '..rrrr..',
      '..gggg..',
    ],
    fixed: { d: '#e7b48f', f: '#efe6d4', g: '#7a1d0c', i: '#ffb02e', j: '#ff5a1f', r: '#c2361a' },
  },
});
