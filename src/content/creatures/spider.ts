import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';
import { BeastForm } from '../model/look';

export default defineCreature({
  id: CreatureId.Spider,
  name: 'Giant Spider',
  attack: CreatureAttack.Spit,
  hpScale: 0.9,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Spider, mass: 6, scale: 4.7 },
});
