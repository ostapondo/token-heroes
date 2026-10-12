import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { Stance } from '../model/look';

export default defineCreature({
  id: CreatureId.Demon,
  name: 'Demon',
  attack: CreatureAttack.Lunge,
  hpScale: 1.1,
  damageScale: 1.3,
  look: {
    rig: 'biped',
    mass: 5,
    stance: Stance.Brute,
    build: {
      scale: 2.2,
      head: 7,
      shoulders: 9,
      hips: 6.5,
      arm: 4,
      forearm: 3.6,
      leg: 4.6,
      calf: 3.8,
    },
    colors: { upper: 'a', fore: 'a', hand: 'b', thigh: 'a', shin: 'b', boot: 'x', torso: 'a' },
    head: { form: 'face', skin: 'a', eyes: 'e', tusks: 'h', hat: { kind: 'ram', color: 'h' } },
    hands: 'claws',
    tail: 'b',
    wings: 'b',
    details: [
      { kind: 'tabard', color: 'x', emblem: 'e' },
      { kind: 'core', color: 'b', glow: 'e' },
      { kind: 'skulls', color: 'h' },
      { kind: 'spikes', color: 'h' },
    ],
  },
});
