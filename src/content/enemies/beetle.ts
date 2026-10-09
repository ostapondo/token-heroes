import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'beetle',
  name: 'Beetle',
  hpScale: 1.6,
  damageScale: 0.6,
  look: { rig: 'beast', form: BeastForm.Beetle, mass: 1.3 },
});
