import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'imp',
  name: 'Imp',
  hpScale: 0.8,
  damageScale: 1.2,
  look: {
    rig: 'biped',
    mass: 0.6,
    stance: Stance.Caster,
    build: { scale: 0.75, head: 8, torso: 12, thigh: 8.5, shin: 8.5, shoulders: 6 },
    colors: { upper: 'a', fore: 'a', hand: 'a', thigh: 'a', shin: 'b', boot: 'x', torso: 'a' },
    head: { form: 'face', skin: 'a', eyes: 'e', hat: { kind: 'horns', color: 'h' } },
    wings: 'b',
    weapon: { kind: 'trident', color: 'x' },
  },
});
