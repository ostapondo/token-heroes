import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'rogue',
  name: 'Rogue',
  order: 6,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  attackInterval: 0.6,
  focus: 0.2,
  sprite: {
    rows: [
      '..dddd..',
      '..dffd..',
      '..dddd..',
      '..rrrr..',
      's.gggg.s',
      's.gggg.s',
      's.gggg.s',
      '..i..i..',
      '..i..i..',
      '..i..i..',
    ],
    fixed: { d: '#2b2f2a', f: '#e7b48f', g: '#3a3f36', i: '#1f221e', r: '#c2361a', s: '#c9d1d9' },
  },
});
