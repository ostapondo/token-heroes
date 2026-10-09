import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { Stance } from '../model/look';

export default defineCreature({
  id: CreatureId.Zombie,
  name: 'Zombie Brute',
  attack: CreatureAttack.Slam,
  hpScale: 1.2,
  damageScale: 0.9,
  look: {
    rig: 'biped',
    mass: 6,
    stance: Stance.Shambler,
    build: { scale: 2.3, shoulders: 9.5, hips: 7, arm: 4.6, forearm: 4.4, leg: 4.8, calf: 4.2 },
    colors: { upper: 'a', fore: 'a', hand: 'a', thigh: 'b', shin: 'a', boot: 'x', torso: 'b' },
    head: { form: 'face', skin: 'a', eyes: 'e', marks: 'x', tusks: 'h' },
    hands: 'claws',
    cloth: [{ at: 'waist', length: 10, width: 6, color: 'x', ragged: true }],
    details: [
      { kind: 'ribs', color: 'h' },
      { kind: 'stitches', color: 'x' },
      { kind: 'strap', color: 'x' },
      { kind: 'chains', color: 'c' },
    ],
    weapon: { kind: 'cleaver', blade: ['#c9d1d9', '#6f7782'] },
  },
});
