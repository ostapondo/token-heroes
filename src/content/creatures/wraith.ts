import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineCreature({
  id: CreatureId.Wraith,
  name: 'Wraith',
  attack: CreatureAttack.Scythe,
  hpScale: 0.8,
  damageScale: 1.4,
  look: { rig: 'beast', form: BeastForm.Wraith, mass: 5, scale: 2.35 },
});
