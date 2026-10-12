import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineSuperBoss({
  id: 'hallucinator',
  name: 'Hallucinator',
  tier: SuperBossTier.Medium,
  order: 2,
  lair: LairId.Mirage,
  attack: CreatureAttack.Spit,
  mechanic: BossMechanic.Hallucinate,
  hpScale: 0.9,
  damageScale: 1.35,
  palette: { a: '#c04ad8', b: '#7a2a9a', c: '#ffb0ff', e: '#ffffff', h: '#5ef0ff', x: '#1a0830' },
  look: { rig: 'beast', form: BeastForm.Eye, mass: 5, scale: 4.5, marks: 'e' },
});
