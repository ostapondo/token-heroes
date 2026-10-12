import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'druid',
  name: 'Druid',
  order: 14,
  role: HeroRole.Tank,
  attack: AttackStyle.Spell,
  attackInterval: 1.9,
  focus: -0.1,
  tint: '#7cc35b',
  look: {
    rig: 'biped',
    mass: 1.6,
    stance: Stance.Caster,
    build: { shoulders: 7.6, hips: 6, arm: 3.7, forearm: 3.3, leg: 4.2 },
    colors: {
      upper: ['#6b5238', '#3a2c1e'],
      fore: ['#6b5238', '#3a2c1e'],
      hand: ['#e7b48f', '#a8765a'],
      thigh: ['#4e6a34', '#2a3a1a'],
      shin: ['#6b5238', '#3a2c1e'],
      boot: ['#4a3220', '#22160c'],
      torso: ['#4e6a34', '#2a3a1a'],
    },
    robe: ['#5a7a3a', '#2e4a1c'],
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      beard: ['#7a5a3c', '#45301e'],
      hat: { kind: 'antlers', color: ['#c9b48a', '#8a7a5a'] },
    },
    details: [
      { kind: 'belt', color: '#6b4a2a' },
      { kind: 'leaves', color: ['#7cc35b', '#3e5a24'] },
      { kind: 'pauldron', color: ['#7a9a4a', '#3e5a24'] },
    ],
    weapon: { kind: 'staff', orb: ['#eaffc0', '#7cc35b'], glow: '#9be37a', wood: '#6b4a2a' },
    cloth: [{ at: 'back', length: 20, width: 8, color: ['#5a7a3a', '#2e4a1c'], ragged: true }],
  },
});
