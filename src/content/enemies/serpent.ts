import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'serpent',
  name: 'Serpent',
  hpScale: 0.8,
  damageScale: 1.1,
  look: { rig: 'beast', form: BeastForm.Serpent, mass: 0.9 },
});
