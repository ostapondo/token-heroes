import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { Stance } from '../model/look';

export default defineSuperBoss({
  id: 'rate-limiter',
  name: 'Rate Limiter',
  tier: SuperBossTier.Strong,
  order: 1,
  lair: LairId.Bastion,
  attack: CreatureAttack.Slam,
  mechanic: BossMechanic.Throttle,
  hpScale: 1.6,
  damageScale: 0.75,
  palette: { a: '#5c6470', b: '#353b45', c: '#a4aeba', e: '#ff3030', h: '#c8a050', x: '#14171c' },
  look: {
    rig: 'biped',
    mass: 7,
    stance: Stance.Brute,
    build: {
      scale: 3.45,
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
    weapon: { kind: 'stop', color: '#c8102e' },
    details: [
      { kind: 'cracks', color: 'c' },
      { kind: 'hourglass', color: 'h', glow: 'e' },
      { kind: 'chains', color: 'c' },
    ],
  },
});
