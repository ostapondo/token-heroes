import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'wanderer',
  name: 'Wanderer',
  order: 1,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  attackInterval: 1.0,
  tint: '#c9ced6',
  look: {
    rig: 'biped',
    mass: 1,
    stance: Stance.Blade,
    colors: {
      upper: ['#8d98a8', '#4a5262'],
      fore: ['#8d98a8', '#4a5262'],
      hand: ['#e7b48f', '#a8765a'],
      thigh: ['#5a4632', '#33271a'],
      shin: ['#6b4a2e', '#3a2614'],
      boot: ['#4a3220', '#22160c'],
      torso: ['#8d98a8', '#4a5262'],
    },
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      hat: { kind: 'straw', color: ['#d9b45a', '#8a6a2a'] },
    },
    details: [
      { kind: 'belt', color: '#6b4a2e' },
      { kind: 'trim', color: '#c9ced6' },
      { kind: 'scabbard', color: '#3a2614', trim: ['#f2c14e', '#9a6a14'] },
    ],
    weapon: { kind: 'sword', length: 29, blade: ['#e8e8f0', '#8a96a6'] },
    cloth: [{ at: 'neck', length: 16, width: 3, color: ['#f2c14e', '#9a6a14'], taper: 0.6 }],
  },
});
