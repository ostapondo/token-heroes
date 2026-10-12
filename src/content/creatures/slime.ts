import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineCreature({
  id: CreatureId.Slime,
  name: 'Slime',
  attack: CreatureAttack.Slam,
  hpScale: 1.4,
  damageScale: 0.7,
  look: { rig: 'beast', form: BeastForm.Slime, mass: 6, scale: 5.2, crown: 'h' },
});
