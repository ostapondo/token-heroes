import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'bat',
  name: 'Bat',
  hpScale: 0.6,
  damageScale: 0.8,
  look: { rig: 'beast', form: BeastForm.Bat, mass: 0.35 },
});
