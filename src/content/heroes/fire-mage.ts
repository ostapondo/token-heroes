import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'fire-mage',
  name: 'Fire Mage',
  order: 5,
  role: HeroRole.Striker,
  attack: AttackStyle.Spell,
  attackInterval: 2.0,
  focus: 0.3,
  tint: '#ff8a4a',
  look: {
    rig: 'biped',
    mass: 0.9,
    stance: Stance.Caster,
    colors: {
      upper: ['#b5321c', '#6a1708'],
      fore: ['#b5321c', '#6a1708'],
      hand: ['#f0c09a', '#b07e5c'],
      thigh: ['#7a1d0c', '#4a1006'],
      shin: ['#3a2018', '#1e0e08'],
      boot: ['#3a2018', '#1a0c06'],
      torso: ['#b5321c', '#6a1708'],
    },
    robe: ['#a12c18', '#5e1408'],
    head: {
      form: 'face',
      skin: ['#f0c09a', '#b07e5c'],
      beard: ['#efe9df', '#a89e8e'],
      hat: { kind: 'wizard', color: ['#9a2412', '#4a0c04'], band: '#ffb02e' },
    },
    details: [
      { kind: 'trim', color: '#ffb02e' },
      { kind: 'belt', color: '#e8b23a' },
      { kind: 'book', color: ['#5a2a6e', '#2a1036'], trim: '#e8b23a' },
    ],
    weapon: { kind: 'staff', orb: ['#ffe08a', '#ff6a2b'], glow: '#ff7a2b', wood: '#5a3a22' },
    cloth: [{ at: 'back', length: 14, width: 6, color: ['#8a1f10', '#4a0c04'] }],
  },
});
