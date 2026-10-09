import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'zombie',
  name: 'Zombie',
  hpScale: 1.3,
  damageScale: 0.8,
  look: {
    rig: 'biped',
    mass: 1.2,
    stance: Stance.Shambler,
    build: { shoulders: 7, arm: 3, forearm: 2.7 },
    colors: { upper: 'a', fore: 'a', hand: 'a', thigh: 'b', shin: 'a', boot: 'x', torso: 'b' },
    head: { form: 'face', skin: 'a', eyes: 'e', marks: 'x' },
    details: [
      { kind: 'strap', color: 'x' },
      { kind: 'belt', color: 'x' },
    ],
  },
});
