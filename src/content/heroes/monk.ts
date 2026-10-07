import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'monk',
  name: 'Monk',
  order: 11,
  role: HeroRole.Striker,
  attack: AttackStyle.Bash,
  attackInterval: 0.7,
  focus: 0.2,
  sprite: {
    rows: [
      '..ffff..',
      '..fvvf..',
      '..ffff..',
      '.oooooff',
      'f.oooo..',
      '..kkkk..',
      '..oooo..',
      '..oooo..',
      '..g..g..',
      '..g..g..',
    ],
    fixed: { f: '#e7b48f', g: '#3a2a1e', k: '#7a3f12', o: '#e8862a', v: '#1a1a22' },
  },
});
