import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'frost-witch',
  name: 'Frost Witch',
  order: 8,
  role: HeroRole.Striker,
  attack: AttackStyle.Spell,
  attackInterval: 1.2,
  focus: 0.1,
  tint: '#bfeaff',
  look: {
    rig: 'biped',
    mass: 0.85,
    stance: Stance.Caster,
    colors: {
      upper: ['#2a6f9e', '#163c5a'],
      fore: ['#2a6f9e', '#163c5a'],
      hand: ['#e7b48f', '#a8765a'],
      thigh: ['#1f4f7a', '#0f2a44'],
      shin: ['#1f4f7a', '#0f2a44'],
      boot: ['#14304c', '#081a2a'],
      torso: ['#1f4f7a', '#0f2a44'],
    },
    robe: ['#1f4f7a', '#0f2a44'],
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      hair: ['#e8f7ff', '#8ab0c4'],
      hat: { kind: 'witch', color: ['#2a6f9e', '#163c5a'], band: '#bfeaff' },
    },
    details: [
      { kind: 'trim', color: '#bfeaff' },
      { kind: 'belt', color: '#c9d1d9' },
      { kind: 'brooch', color: '#e8f7ff', glow: '#9fd6ff' },
    ],
    weapon: { kind: 'staff', orb: ['#f0fbff', '#7cc8ff'], glow: '#9fd6ff', wood: '#cfe8f5' },
    cloth: [{ at: 'head', length: 15, width: 4.5, color: ['#e8f7ff', '#8ab0c4'], taper: 0.4 }],
  },
});
