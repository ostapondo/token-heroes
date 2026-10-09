import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'sentinel',
  name: 'Sentinel',
  order: 13,
  role: HeroRole.Tank,
  attack: AttackStyle.Arrow,
  attackInterval: 1.6,
  focus: 0.2,
  tint: '#5fa889',
  look: {
    rig: 'biped',
    mass: 1.5,
    metal: true,
    stance: Stance.Archer,
    build: { shoulders: 7.2, arm: 3.5 },
    colors: {
      upper: ['#6f8a80', '#38483f'],
      fore: ['#d5dce6', '#6f7b8c'],
      hand: ['#d5dce6', '#6f7b8c'],
      thigh: ['#2f5a4a', '#173026'],
      shin: ['#d5dce6', '#6f7b8c'],
      boot: ['#3a3f4a', '#1c2028'],
      torso: ['#6f8a80', '#38483f'],
    },
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      hat: { kind: 'kettle', color: ['#8d98a8', '#4a5262'] },
    },
    details: [{ kind: 'belt', color: '#3a2a1e' }],
    weapon: { kind: 'crossbow', wood: '#6b4a2a' },
    cloth: [{ at: 'back', length: 19, width: 7, color: ['#2f5a4a', '#173026'] }],
  },
});
