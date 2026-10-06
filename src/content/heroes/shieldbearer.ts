import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'shieldbearer',
  name: 'Shieldbearer',
  order: 3,
  role: HeroRole.Tank,
  attack: AttackStyle.Bash,
  attackInterval: 1.4,
  sprite: {
    rows: [
      '..dddd..',
      '..vvvv..',
      '..dddd..',
      'gggfff..',
      'gigfff..',
      'gigfff..',
      'gggfff..',
      'ggj..j..',
      '..j..j..',
      '..j..j..',
    ],
    fixed: { d: '#8d95a3', f: '#5e6675', g: '#b9842f', i: '#e8b23a', j: '#3a3f4a', v: '#1a1a22' },
  },
});
