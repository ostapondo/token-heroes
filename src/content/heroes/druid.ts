import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'druid',
  name: 'Druid',
  order: 14,
  role: HeroRole.Tank,
  attack: AttackStyle.Spell,
  attackInterval: 1.9,
  focus: -0.1,
  sprite: {
    rows: [
      '.k....k.',
      '..kddk.o',
      '..dffd.o',
      '.dggggdw',
      '.dglggdw',
      '.dggggdw',
      '.dggggdw',
      '..g..g.w',
      '..g..g.w',
      '..m..m.w',
    ],
    fixed: {
      d: '#3d6b2f',
      f: '#e7b48f',
      g: '#7a5a34',
      k: '#c9b48a',
      l: '#8fd14f',
      m: '#3a2a1e',
      o: '#b6f06a',
      w: '#4a3626',
    },
  },
});
