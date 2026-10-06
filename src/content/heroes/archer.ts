import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'archer',
  name: 'Archer',
  order: 2,
  role: HeroRole.Striker,
  attack: AttackStyle.Arrow,
  attackInterval: 0.8,
  focus: 0.1,
  sprite: {
    rows: [
      '..dddd..',
      '..dffd..',
      'iddffd..',
      'idgggg..',
      'i.gggg..',
      'i.gggg..',
      'i.gggg..',
      'i.w..w..',
      '..w..w..',
      '..w..w..',
    ],
    fixed: { d: '#4f9a4c', f: '#e7b48f', g: '#3d7a3a', i: '#c08a4a', w: '#5a4632' },
  },
});
