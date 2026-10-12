import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'slime',
  name: 'Slime',
  hpScale: 1.2,
  damageScale: 0.7,
  look: { rig: 'beast', form: BeastForm.Slime, mass: 1 },
});
