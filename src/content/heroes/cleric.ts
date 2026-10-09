import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'cleric',
  name: 'Cleric',
  order: 4,
  role: HeroRole.Healer,
  attack: AttackStyle.Heal,
  attackInterval: 1.6,
  tint: '#fff3c4',
  look: {
    rig: 'biped',
    mass: 0.9,
    stance: Stance.Caster,
    colors: {
      upper: ['#efe6d4', '#a89e8a'],
      fore: ['#efe6d4', '#a89e8a'],
      hand: ['#e7b48f', '#a8765a'],
      thigh: ['#c9bfa8', '#8a806c'],
      shin: ['#8a6a4a', '#4e3824'],
      boot: ['#6b4a2e', '#3a2614'],
      torso: ['#efe6d4', '#a89e8a'],
    },
    robe: ['#e8dfcc', '#9a907c'],
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      hair: ['#8a5a32', '#4e3018'],
      hat: { kind: 'circlet', color: ['#f2c14e', '#9a6a14'] },
    },
    details: [
      { kind: 'trim', color: ['#f2c14e', '#9a6a14'] },
      { kind: 'belt', color: '#c08a4a' },
      { kind: 'emblem', color: ['#f2c14e', '#9a6a14'], glow: '#ffe9a0' },
    ],
    weapon: { kind: 'staff', orb: ['#fff8dc', '#f2c14e'], glow: '#ffe9a0', wood: '#c08a4a' },
    cloth: [{ at: 'back', length: 15, width: 6.5, color: ['#efe6d4', '#a89e8a'] }],
  },
});
