import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { Stance } from '../model/look';

export default defineSuperBoss({
  id: 'paperclip-maximizer',
  name: 'Paperclip Maximizer',
  tier: SuperBossTier.Strong,
  order: 4,
  lair: LairId.Foundry,
  attack: CreatureAttack.Spit,
  mechanic: BossMechanic.Maximize,
  hpScale: 1.0,
  damageScale: 1.2,
  palette: { a: '#b8c0c8', b: '#6a747e', c: '#f0f4f8', e: '#ff3a2a', h: '#ffd24a', x: '#1a1e24' },
  look: {
    rig: 'biped',
    mass: 7,
    metal: true,
    stance: Stance.Brute,
    build: {
      scale: 3.5,
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
    colors: { upper: 'a', fore: 'b', hand: 'a', thigh: 'b', shin: 'a', boot: 'x', torso: 'b' },
    head: { form: 'helm', metal: 'a', shape: 'bucket', visor: 'e', crest: 'h' },
    fist: 1.3,
    weapon: { kind: 'paperclip', color: 'c' },
    details: [
      { kind: 'plate', color: 'a' },
      { kind: 'core', color: 'b', glow: 'e' },
      { kind: 'clips', color: 'h' },
    ],
  },
});
