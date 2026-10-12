import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineCreature({
  id: CreatureId.Dragon,
  name: 'Dragon',
  attack: CreatureAttack.Breath,
  hpScale: 1.3,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Dragon, mass: 7, scale: 1.5 },
});
