import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'sentinel',
  name: 'Sentinel',
  order: 13,
  role: HeroRole.Tank,
  attack: AttackStyle.Arrow,
  attackInterval: 1.6,
  focus: 0.2,
  sprite: {
    rows: [
      '..dddd..',
      '.dddddd.',
      '..fvvf..',
      'ggiiii.k',
      'gniiiwwk',
      'ggiiii.k',
      'ggiiii..',
      'ggj..j..',
      '..j..j..',
      '..j..j..',
    ],
    fixed: {
      d: '#5e6675',
      f: '#e7b48f',
      g: '#2f5d3a',
      i: '#8d95a3',
      j: '#3a3f4a',
      k: '#c08a4a',
      n: '#e8b23a',
      v: '#1a1a22',
      w: '#6b4a2e',
    },
  },
});
