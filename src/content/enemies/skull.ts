import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'skull',
  name: 'Burning Skull',
  hpScale: 0.6,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Skull, mass: 0.4 },
});
