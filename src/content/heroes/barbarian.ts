import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'barbarian',
  name: 'Barbarian',
  order: 7,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  baseDamage: 12,
  baseHp: 30,
  attackInterval: 1.5,
  levelCostBase: 220,
  hireCost: 1_000_000,
  unlockAtTokens: 100_000_000,
  sprite: {
    rows: [
      '.ddddd.s',
      '.dddddws',
      '.fffffws',
      '.fdddfws',
      'ffdddfw.',
      'ffffffw.',
      'ggggggw.',
      '.ii.iiw.',
      '.ii.iiw.',
      '.ii.ii..',
    ],
    fixed: { d: '#c06a2a', f: '#e7b48f', g: '#8a6a4a', i: '#5a4632', s: '#c9d1d9', w: '#6b4a2e' },
  },
});
