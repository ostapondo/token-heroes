import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'spider',
  name: 'Spider',
  hpScale: 0.8,
  damageScale: 1.1,
  look: { rig: 'beast', form: BeastForm.Spider, mass: 0.7 },
});
