import { defineEnemy } from '../model/definitions';
import { Stance } from '../model/look';

export default defineEnemy({
  id: 'armor',
  name: 'Hollow Armor',
  hpScale: 1.4,
  damageScale: 0.9,
  look: {
    rig: 'biped',
    mass: 1.7,
    metal: true,
    stance: Stance.Blade,
    build: { shoulders: 7.6, arm: 3.6, forearm: 3.2 },
    colors: { upper: 'c', fore: 'c', hand: 'c', thigh: 'a', shin: 'c', boot: 'a', torso: 'c' },
    head: { form: 'helm', shape: 'great', metal: 'c', visor: 'e' },
    details: [{ kind: 'belt', color: 'b' }],
    weapon: { kind: 'sword', length: 28, blade: ['#c9d1d9', '#6f7782'] },
  },
});
