import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'mimic',
  name: 'Mimic',
  hpScale: 1.2,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Mimic, mass: 1.4 },
});
