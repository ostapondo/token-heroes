import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'boar',
  name: 'Boar',
  hpScale: 1.4,
  damageScale: 0.9,
  look: { rig: 'beast', form: BeastForm.Boar, mass: 1.6 },
});
