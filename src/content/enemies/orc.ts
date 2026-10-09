import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'orc',
  name: 'Orc',
  hpScale: 1.4,
  damageScale: 1.1,
  look: {
    rig: 'biped',
    mass: 1.9,
    stance: Stance.Blade,
    build: { scale: 1.2, shoulders: 8, hips: 6, arm: 3.8, forearm: 3.4, leg: 4.2, calf: 3.6 },
    colors: { upper: 'a', fore: 'x', hand: 'a', thigh: 'x', shin: 'a', boot: 'x', torso: 'x' },
    head: { form: 'face', skin: 'a', eyes: 'e', hair: 'x', tusks: 'h', marks: 'b' },
    details: [
      { kind: 'plate', color: ['#8a8f98', '#454950'] },
      { kind: 'belt', color: 'x' },
    ],
    weapon: { kind: 'cleaver', blade: ['#c9d1d9', '#6f7782'] },
  },
});
