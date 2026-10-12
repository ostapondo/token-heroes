import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'mushroom',
  name: 'Sporeling',
  hpScale: 0.9,
  damageScale: 0.8,
  look: { rig: 'beast', form: BeastForm.Mushroom, mass: 0.7 },
});
