import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'shieldbearer',
  name: 'Shieldbearer',
  order: 3,
  role: 'tank',
  attack: 'bash',
  baseDamage: 2,
  baseHp: 45,
  attackInterval: 1.4,
  levelCostBase: 60,
  hireCost: 5_000,
  unlockAtTokens: 0,
  sprite: {
    rows: [
      '..dddd..',
      '..vvvv..',
      '..dddd..',
      'gggfff..',
      'gigfff..',
      'gigfff..',
      'gggfff..',
      'ggj..j..',
      '..j..j..',
      '..j..j..',
    ],
    fixed: { d: '#8d95a3', f: '#5e6675', g: '#b9842f', i: '#e8b23a', j: '#3a3f4a', v: '#1a1a22' },
  },
});
