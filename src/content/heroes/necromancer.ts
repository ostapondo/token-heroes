import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'necromancer',
  name: 'Necromancer',
  order: 9,
  role: HeroRole.Healer,
  attack: AttackStyle.Heal,
  attackInterval: 1.8,
  tint: '#52e0c4',
  look: {
    rig: 'biped',
    mass: 0.85,
    stance: Stance.Caster,
    colors: {
      upper: ['#2a2a2e', '#121214'],
      fore: ['#2a2a2e', '#121214'],
      hand: ['#d9d1b8', '#8a826c'],
      thigh: ['#1f1f24', '#0c0c0e'],
      shin: ['#1f1f24', '#0c0c0e'],
      boot: ['#1a1a1a', '#080808'],
      torso: ['#2a2a2e', '#121214'],
    },
    robe: ['#1f1f24', '#0c0c0e'],
    head: { form: 'cowl', cloth: ['#2a2a2e', '#121214'], eyes: '#52e0c4' },
    details: [
      { kind: 'belt', color: '#e9e2cc' },
      { kind: 'buckle', color: ['#e9e2cc', '#8a826c'], glow: '#52e0c4' },
    ],
    weapon: { kind: 'staff', orb: ['#e9e2cc', '#8a826c'], glow: '#52e0c4', wood: '#e9e2cc' },
    cloth: [{ at: 'back', length: 19, width: 7.5, color: ['#24242a', '#0c0c0e'], ragged: true }],
  },
});
