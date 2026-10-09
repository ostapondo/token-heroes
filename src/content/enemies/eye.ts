import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'eye',
  name: 'Watcher',
  hpScale: 0.7,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Eye, mass: 0.6 },
});
