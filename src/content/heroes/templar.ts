import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'templar',
  name: 'Templar',
  order: 12,
  role: HeroRole.Tank,
  attack: AttackStyle.Slash,
  attackInterval: 1.1,
  focus: 0.1,
  sprite: {
    rows: [
      '..dddd.s',
      '..dvvd.s',
      '..dddd.s',
      'kkwrww.s',
      'kkrrrwqq',
      'kkwrww..',
      '..wrww..',
      '..d..d..',
      '..d..d..',
      '..j..j..',
    ],
    fixed: {
      d: '#c9ced6',
      j: '#3a3f4a',
      k: '#5e6675',
      q: '#b9842f',
      r: '#c2361a',
      s: '#e8e8f0',
      v: '#1a1a22',
      w: '#efe6d4',
    },
  },
});
