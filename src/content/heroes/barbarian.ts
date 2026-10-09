import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'barbarian',
  name: 'Barbarian',
  order: 7,
  role: HeroRole.Striker,
  attack: AttackStyle.Slash,
  attackInterval: 1.5,
  focus: -0.2,
  tint: '#e8b23a',
  look: {
    rig: 'biped',
    mass: 1.5,
    stance: Stance.Blade,
    build: { shoulders: 7.6, hips: 5.8, arm: 3.9, forearm: 3.4, leg: 4.2 },
    colors: {
      upper: ['#d99a6c', '#94593a'],
      fore: ['#d99a6c', '#94593a'],
      hand: ['#d99a6c', '#94593a'],
      thigh: ['#7a5a3c', '#45301e'],
      shin: ['#d99a6c', '#94593a'],
      boot: ['#8a6a4a', '#4e3824'],
      torso: ['#d99a6c', '#94593a'],
    },
    head: {
      form: 'face',
      skin: ['#d99a6c', '#94593a'],
      hair: ['#d8752a', '#8e4515'],
      beard: ['#d8752a', '#8e4515'],
      hat: { kind: 'horned', metal: ['#d5dce6', '#6f7b8c'], horn: ['#e8dcc0', '#9a8a6a'] },
    },
    details: [
      { kind: 'strap', color: '#5a3a22' },
      { kind: 'belt', color: '#5a3a22' },
      { kind: 'buckle', color: ['#f2c14e', '#9a6a14'], glow: '#f2c14e' },
      { kind: 'necklace', color: ['#efe6d4', '#a89e8a'] },
      { kind: 'pauldron', color: ['#9a7a58', '#5a4430'] },
    ],
    weapon: { kind: 'axe', blade: ['#d5dce6', '#6f7b8c'] },
    cloth: [
      { at: 'back', length: 13, width: 8, color: ['#9a7a58', '#5a4430'], ragged: true },
      { at: 'head', length: 11, width: 2.6, color: ['#d8752a', '#8e4515'], taper: 0.5 },
    ],
  },
});
