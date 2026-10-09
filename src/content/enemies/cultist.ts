import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'cultist',
  name: 'Cultist',
  hpScale: 0.7,
  damageScale: 1.3,
  look: {
    rig: 'biped',
    mass: 0.8,
    stance: Stance.Caster,
    colors: { upper: 'a', fore: 'a', hand: 'h', thigh: 'b', shin: 'b', boot: 'x', torso: 'a' },
    head: { form: 'cowl', cloth: 'a', eyes: 'e', mask: 'h' },
    robe: 'a',
    weapon: { kind: 'staff', orb: 'c', glow: 'e', wood: 'x' },
  },
});
