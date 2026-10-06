import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'cleric',
  name: 'Cleric',
  order: 4,
  role: 'healer',
  attack: 'heal',
  baseDamage: 3,
  baseHp: 16,
  attackInterval: 1.6,
  levelCostBase: 70,
  hireCost: 25_000,
  unlockAtTokens: 0,
  sprite: {
    rows: [
      '..ddddjj',
      '..dffdjj',
      '..dffd.i',
      '.ddddd.i',
      '.ddgdd.i',
      '.dgggd.i',
      '.ddgdd.i',
      '.ddgdd.i',
      '.ddddd.i',
      '.ddddd.i',
    ],
    fixed: { d: '#efe6d4', f: '#e7b48f', g: '#e8b23a', i: '#c08a4a', j: '#fff3c4' },
  },
});
