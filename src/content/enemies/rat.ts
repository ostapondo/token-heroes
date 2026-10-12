import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'rat',
  name: 'Rat',
  hpScale: 0.5,
  damageScale: 0.6,
  look: { rig: 'beast', form: BeastForm.Rat, mass: 0.4 },
});
