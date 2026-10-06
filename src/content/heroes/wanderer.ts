import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'wanderer',
  name: 'Wanderer',
  order: 1,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  baseDamage: 5,
  baseHp: 30,
  attackInterval: 1.0,
  levelCostBase: 40,
  hireCost: 0,
  unlockAtTokens: 0,
  sprite: {
    rows: [
      '..dddd.s',
      '..dvvd.s',
      '..dddd.s',
      '..ffff.s',
      '.gffffgs',
      '.gffffgs',
      '..ffff..',
      '..w..w..',
      '..w..w..',
      '..w..w..',
    ],
    fixed: { d: '#c9ced6', f: '#e8b23a', g: '#e7b48f', s: '#e8e8f0', v: '#1a1a22', w: '#6b4a2e' },
  },
});
