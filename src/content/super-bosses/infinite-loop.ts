import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineSuperBoss({
  id: 'infinite-loop',
  name: 'Infinite Loop',
  tier: SuperBossTier.Strong,
  order: 2,
  lair: LairId.Recursion,
  attack: CreatureAttack.Slam,
  mechanic: BossMechanic.Loop,
  hpScale: 1.2,
  damageScale: 1.0,
  palette: { a: '#f2b134', b: '#a8641a', c: '#ffe9a0', e: '#3ad06a', h: '#fff6d6', x: '#2a1606' },
  look: { rig: 'beast', form: BeastForm.Serpent, mass: 6, scale: 4.45, marks: 'e' },
});
