import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'rogue',
  name: 'Rogue',
  order: 6,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  attackInterval: 0.6,
  focus: 0.2,
  tint: '#c2361a',
  look: {
    rig: 'biped',
    mass: 0.85,
    stance: Stance.Stalker,
    build: { shoulders: 6, arm: 2.9, forearm: 2.6 },
    colors: {
      upper: ['#3a3f36', '#1a1d18'],
      fore: ['#2b2f2a', '#141612'],
      hand: ['#2b2f2a', '#141612'],
      thigh: ['#3a3f36', '#1a1d18'],
      shin: ['#2b2f2a', '#141612'],
      boot: ['#1f221e', '#0c0e0b'],
      torso: ['#3a3f36', '#1a1d18'],
    },
    head: {
      form: 'face',
      skin: ['#e7b48f', '#a8765a'],
      hood: ['#2b2f2a', '#141612'],
      mask: ['#c2361a', '#6e1a0c'],
    },
    details: [
      { kind: 'strap', color: '#5a3a22' },
      { kind: 'belt', color: '#1f221e' },
      { kind: 'knives', color: '#c9d1d9' },
    ],
    weapon: { kind: 'dagger', color: ['#c9d1d9', '#6f7782'] },
    offhand: { kind: 'dagger', color: ['#c9d1d9', '#6f7782'] },
    cloth: [{ at: 'neck', length: 17, width: 2.6, color: ['#c2361a', '#6e1a0c'], taper: 0.5 }],
  },
});
