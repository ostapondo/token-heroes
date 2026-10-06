import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'fire-mage',
  name: 'Fire Mage',
  order: 5,
  role: HeroRole.Striker,
  attack: AttackStyle.Spell,
  attackInterval: 2.0,
  focus: 0.3,
  sprite: {
    rows: [
      '...r....',
      '..rrr...',
      '..rrr...',
      '.rrrrrr.',
      '..ddd...',
      '..rffrij',
      '..rffrii',
      '..rrrr..',
      '..rrrr..',
      '..gggg..',
    ],
    fixed: { d: '#e7b48f', f: '#efe6d4', g: '#7a1d0c', i: '#ffb02e', j: '#ff5a1f', r: '#c2361a' },
  },
});
