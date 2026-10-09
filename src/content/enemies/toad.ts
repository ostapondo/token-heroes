import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'toad',
  name: 'Toad',
  hpScale: 1.2,
  damageScale: 0.7,
  look: { rig: 'beast', form: BeastForm.Toad, mass: 1 },
});
