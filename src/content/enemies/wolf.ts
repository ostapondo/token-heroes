import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'wolf',
  name: 'Wolf',
  hpScale: 1.1,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Wolf, mass: 1.1 },
});
