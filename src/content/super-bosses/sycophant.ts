import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { Stance } from '../model/look';

export default defineSuperBoss({
  id: 'sycophant',
  name: 'Sycophant',
  tier: SuperBossTier.Medium,
  order: 4,
  lair: LairId.Court,
  attack: CreatureAttack.Lunge,
  mechanic: BossMechanic.Flatter,
  hpScale: 1.5,
  damageScale: 0.8,
  palette: { a: '#d84a8a', b: '#8a2a5a', c: '#ffc8dc', e: '#2a1408', h: '#ffd36a', x: '#2a0a1a' },
  look: {
    rig: 'biped',
    mass: 5,
    stance: Stance.Stalker,
    build: {
      scale: 2.5,
      head: 7,
      shoulders: 9,
      hips: 6.5,
      arm: 4,
      forearm: 3.6,
      leg: 4.6,
      calf: 3.8,
    },
    colors: { upper: 'a', fore: 'a', hand: 'c', thigh: 'x', shin: 'x', boot: 'x', torso: 'b' },
    head: {
      form: 'face',
      skin: 'a',
      eyes: 'e',
      grin: 'h',
      hat: { kind: 'tophat', color: 'x', band: 'h' },
    },
    offhand: { kind: 'mirror', frame: 'h', glass: 'c' },
    tail: 'a',
    cloth: [{ at: 'back', length: 22, width: 6, color: 'b', taper: 0.9 }],
    details: [
      { kind: 'trim', color: 'h' },
      { kind: 'bowtie', color: 'h' },
      { kind: 'brooch', color: 'h', glow: 'c' },
    ],
  },
});
