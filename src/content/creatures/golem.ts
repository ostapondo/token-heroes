import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { Stance } from '../model/look';

export default defineCreature({
  id: CreatureId.Golem,
  name: 'Golem',
  attack: CreatureAttack.Slam,
  hpScale: 1.6,
  damageScale: 0.8,
  look: {
    rig: 'biped',
    mass: 7,
    stance: Stance.Brute,
    build: {
      scale: 2.55,
      head: 6,
      neck: 6.5,
      torso: 17,
      upper: 12,
      fore: 12,
      thigh: 8.5,
      shin: 8.5,
      shoulders: 10.5,
      hips: 7,
      arm: 5.2,
      forearm: 6,
      leg: 5,
      calf: 5.2,
    },
    colors: { upper: 'b', fore: 'b', hand: 'a', thigh: 'b', shin: 'b', boot: 'x', torso: 'b' },
    head: { form: 'rock', color: 'a', eyes: 'e' },
    fist: 1.45,
    hands: 'rock',
    details: [
      { kind: 'cracks', color: 'c' },
      { kind: 'core', color: 'e', glow: 'c' },
      { kind: 'crystals', color: 'c', glow: 'e' },
    ],
  },
});
