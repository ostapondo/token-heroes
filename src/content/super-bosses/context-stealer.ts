import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineSuperBoss({
  id: 'context-stealer',
  name: 'Context Stealer',
  tier: SuperBossTier.Medium,
  order: 1,
  lair: LairId.Archive,
  attack: CreatureAttack.Lunge,
  mechanic: BossMechanic.StealContext,
  hpScale: 1.0,
  damageScale: 1.2,
  palette: { a: '#4a3c96', b: '#2c2360', c: '#8a7ae0', e: '#7dfcff', h: '#d8d0f0', x: '#120d2a' },
  look: { rig: 'beast', form: BeastForm.Wraith, mass: 5, scale: 2.9, marks: 'c', lantern: 'e' },
});
