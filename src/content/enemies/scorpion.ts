import { defineEnemy } from '../model/definitions';
import { BeastForm } from '../model/look';

export default defineEnemy({
  id: 'scorpion',
  name: 'Scorpion',
  hpScale: 0.9,
  damageScale: 1.2,
  look: { rig: 'beast', form: BeastForm.Scorpion, mass: 0.9 },
});
