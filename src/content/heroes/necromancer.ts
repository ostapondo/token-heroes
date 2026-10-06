import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';

export default defineHero({
  id: 'necromancer',
  name: 'Necromancer',
  order: 9,
  role: HeroRole.Healer,
  attack: AttackStyle.Heal,
  attackInterval: 1.8,
  sprite: {
    rows: [
      '..ddddjj',
      '..dggdjj',
      '..dffd.w',
      '.iiiiiiw',
      '.iiiiiiw',
      '.iiiiiiw',
      '.iiiiiiw',
      '.iiiiiiw',
      '.iiiiiiw',
      '.ggggggw',
    ],
    fixed: { d: '#1a1a1a', f: '#d9d1b8', g: '#52e0c4', i: '#1f2a28', j: '#e9e2cc', w: '#6b4a2e' },
  },
});
