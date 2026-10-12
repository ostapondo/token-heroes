import { BossMechanic, SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineSuperBoss({
  id: 'prompt-injector',
  name: 'Prompt Injector',
  tier: SuperBossTier.Medium,
  order: 3,
  lair: LairId.Mire,
  attack: CreatureAttack.Spit,
  mechanic: BossMechanic.Inject,
  hpScale: 0.95,
  damageScale: 1.25,
  palette: { a: '#5a6a7a', b: '#36404c', c: '#d8e4ee', e: '#ff3b5c', h: '#e8eef4', x: '#14181e' },
  look: { rig: 'beast', form: BeastForm.Spider, mass: 6, scale: 5.5, marks: 'e', needle: 'e' },
});
