import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'frost-witch',
  name: 'Frost Witch',
  order: 8,
  role: HeroRole.Striker,
  attack: AttackStyle.Spell,
  attackInterval: 1.2,
  focus: 0.1,
  sprite: {
    rows: [
      '....d...',
      '...dd...',
      '...dd...',
      '.dddddd.',
      '..fggf.j',
      '..fggf.j',
      '..fddf..',
      '..diid..',
      '..diid..',
      '..diid..',
    ],
    fixed: { d: '#1f4f7a', f: '#e8f7ff', g: '#e7b48f', i: '#2a6f9e', j: '#bfeaff' },
  },
});
