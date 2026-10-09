import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'crow',
  name: 'Crow',
  hpScale: 0.6,
  damageScale: 1.0,
  look: { rig: 'beast', form: BeastForm.Crow, mass: 0.4 },
});
