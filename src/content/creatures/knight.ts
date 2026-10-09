import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { Stance } from '../model/look';

export default defineCreature({
  id: CreatureId.Knight,
  name: 'Skeleton Knight',
  attack: CreatureAttack.Lunge,
  hpScale: 1.0,
  damageScale: 1.1,
  look: {
    rig: 'biped',
    mass: 4,
    metal: true,
    stance: Stance.Guard,
    build: { scale: 2.1, arm: 2.4, forearm: 2.2, leg: 2.6, calf: 2.4, shoulders: 7.4, hips: 5.4 },
    colors: { upper: 'a', fore: 'h', hand: 'h', thigh: 'h', shin: 'a', boot: 'x', torso: 'a' },
    head: {
      form: 'skull',
      color: 'h',
      eyes: 'e',
      hat: { kind: 'horned', metal: 'a', horn: 'h' },
    },
    hands: 'bones',
    cloth: [{ at: 'back', length: 26, width: 8, color: 'b', ragged: true }],
    details: [
      { kind: 'plate', color: 'c' },
      { kind: 'ribs', color: 'h' },
      { kind: 'spikes', color: 'c' },
      { kind: 'chains', color: 'c' },
    ],
    weapon: { kind: 'sword', length: 34, blade: ['#c9d1d9', '#6f7782'] },
    offhand: { kind: 'kite', color: 'a', emblem: 'e' },
  },
});
