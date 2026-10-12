import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'golemite',
  name: 'Golemite',
  hpScale: 1.6,
  damageScale: 0.7,
  look: {
    rig: 'biped',
    mass: 1.6,
    stance: Stance.Brute,
    build: {
      scale: 0.95,
      head: 5.5,
      neck: 6,
      torso: 14,
      upper: 8,
      fore: 8,
      thigh: 7,
      shin: 7,
      shoulders: 8.5,
      hips: 6,
      arm: 4,
      forearm: 4.4,
      leg: 4,
      calf: 4,
    },
    colors: { upper: 'b', fore: 'b', hand: 'a', thigh: 'b', shin: 'b', boot: 'x', torso: 'b' },
    head: { form: 'rock', color: 'a', eyes: 'e' },
    fist: 1.4,
    details: [{ kind: 'core', color: 'e', glow: 'c' }],
  },
});
