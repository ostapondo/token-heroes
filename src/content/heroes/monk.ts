import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'monk',
  name: 'Monk',
  order: 11,
  role: HeroRole.Striker,
  attack: AttackStyle.Bash,
  attackInterval: 0.7,
  focus: 0.2,
  tint: '#e8862a',
  look: {
    rig: 'biped',
    mass: 1,
    stance: Stance.Brawler,
    fist: 1.35,
    colors: {
      upper: ['#e7b48f', '#a8765a'],
      fore: ['#efe6d4', '#a89e8a'],
      hand: ['#efe6d4', '#a89e8a'],
      thigh: ['#3a2a1e', '#1a120c'],
      shin: ['#3a2a1e', '#1a120c'],
      boot: ['#e7b48f', '#a8765a'],
      torso: ['#e8862a', '#9a4e14'],
    },
    head: { form: 'face', skin: ['#e7b48f', '#a8765a'], marks: '#7a3f12' },
    details: [
      { kind: 'belt', color: '#7a3f12' },
      { kind: 'strap', color: '#9a4e14' },
      { kind: 'beads', color: '#5a2a10' },
    ],
    cloth: [{ at: 'waist', length: 12, width: 2.2, color: ['#7a3f12', '#4a250a'], taper: 0.6 }],
  },
});
