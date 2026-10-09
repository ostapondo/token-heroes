import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'skeleton',
  name: 'Skeleton',
  hpScale: 1.0,
  damageScale: 1.0,
  look: {
    rig: 'biped',
    mass: 0.8,
    stance: Stance.Blade,
    build: { arm: 1.8, forearm: 1.6, leg: 2.1, calf: 1.9, shoulders: 5.6, hips: 4.2 },
    colors: { upper: 'h', fore: 'h', hand: 'h', thigh: 'h', shin: 'h', boot: 'h', torso: 'x' },
    head: { form: 'skull', color: 'h', eyes: 'e' },
    details: [{ kind: 'ribs', color: 'h' }],
    weapon: { kind: 'sword', length: 21, blade: 'b' },
  },
});
