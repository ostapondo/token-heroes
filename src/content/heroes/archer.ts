import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'archer',
  name: 'Archer',
  order: 2,
  role: HeroRole.Striker,
  attack: AttackStyle.Arrow,
  attackInterval: 0.8,
  focus: 0.1,
  tint: '#7cc35b',
  look: {
    rig: 'biped',
    mass: 1,
    stance: Stance.Archer,
    colors: {
      upper: ['#4f9a4c', '#2a5a28'],
      fore: ['#8a5a32', '#4e3018'],
      hand: ['#e7b48f', '#a8765a'],
      thigh: ['#6b5238', '#3a2c1e'],
      shin: ['#7a5232', '#3f2a16'],
      boot: ['#4a3220', '#22160c'],
      torso: ['#3d7a3a', '#1f4a1e'],
    },
    head: { form: 'face', skin: ['#e7b48f', '#a8765a'], hood: ['#4f9a4c', '#2a5a28'] },
    details: [
      { kind: 'strap', color: '#6b4a2a' },
      { kind: 'belt', color: '#4a3220' },
      { kind: 'pouch', color: ['#8a5a32', '#4e3018'] },
    ],
    weapon: { kind: 'bow', wood: '#c08a4a' },
    quiver: ['#8a5a32', '#4e3018'],
    cloth: [{ at: 'head', length: 7, width: 1.8, color: ['#d8432e', '#7e1e12'], taper: 0.3 }],
  },
});
