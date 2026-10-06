import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'paladin',
  name: 'Paladin',
  order: 10,
  role: HeroRole.Tank,
  attack: AttackStyle.Bash,
  baseDamage: 6,
  baseHp: 70,
  attackInterval: 1.3,
  levelCostBase: 600,
  hireCost: 10_000_000,
  unlockAtTokens: 1_000_000_000,
  sprite: {
    rows: [
      '..ddddii',
      '..dvvdii',
      '..dddd.w',
      '..fggf.w',
      '..fggf.w',
      '..fggf.w',
      '..fggf.w',
      '..i..i..',
      '..i..i..',
      '..i..i..',
    ],
    fixed: { d: '#e8b23a', f: '#c9ced6', g: '#2a6f9e', i: '#8d95a3', v: '#1a1a22', w: '#6b4a2e' },
  },
});
