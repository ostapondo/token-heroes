import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'ghost',
  name: 'Ghost',
  hpScale: 0.6,
  damageScale: 1.1,
  look: { rig: 'beast', form: BeastForm.Ghost, mass: 0.4 },
});
