import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'goblin',
  name: 'Goblin',
  hpScale: 1.0,
  damageScale: 1.0,
  look: {
    rig: 'biped',
    mass: 0.7,
    stance: Stance.Stalker,
    build: {
      scale: 0.8,
      head: 8.2,
      torso: 13,
      upper: 9,
      fore: 8.5,
      thigh: 9.5,
      shin: 9.5,
      shoulders: 6,
      hips: 5,
    },
    colors: { upper: 'a', fore: 'a', hand: 'a', thigh: 'x', shin: 'a', boot: 'x', torso: 'x' },
    head: { form: 'face', skin: 'a', eyes: 'e', ears: 'a', nose: 'a' },
    details: [{ kind: 'belt', color: 'c' }],
    weapon: { kind: 'dagger', color: ['#c9d1d9', '#6f7782'] },
  },
});
