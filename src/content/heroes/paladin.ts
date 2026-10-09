import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'paladin',
  name: 'Paladin',
  order: 10,
  role: HeroRole.Tank,
  attack: AttackStyle.Bash,
  attackInterval: 1.3,
  focus: -0.1,
  tint: '#6fa8ff',
  look: {
    rig: 'biped',
    mass: 1.3,
    metal: true,
    stance: Stance.Guard,
    build: { shoulders: 7 },
    colors: {
      upper: ['#d5dce6', '#6f7b8c'],
      fore: ['#d5dce6', '#6f7b8c'],
      hand: ['#d5dce6', '#6f7b8c'],
      thigh: ['#8e98a8', '#4f5868'],
      shin: ['#d5dce6', '#6f7b8c'],
      boot: ['#5a6474', '#2c323c'],
      torso: ['#d5dce6', '#6f7b8c'],
    },
    head: {
      form: 'helm',
      shape: 'round',
      metal: ['#d5dce6', '#6f7b8c'],
      visor: '#9fd6ff',
      plume: ['#d8432e', '#7e1e12'],
    },
    details: [
      { kind: 'tabard', color: ['#2f6fd6', '#1b4290'], emblem: ['#f2c14e', '#9a6a14'] },
      { kind: 'belt', color: '#5a3a22' },
      { kind: 'pauldron', color: ['#d5dce6', '#6f7b8c'] },
    ],
    weapon: { kind: 'sword', length: 27, blade: ['#eef2f6', '#8a96a6'] },
    offhand: { kind: 'kite', color: ['#2f6fd6', '#1b4290'], emblem: ['#f2c14e', '#9a6a14'] },
    cloth: [{ at: 'back', length: 21, width: 7.5, color: ['#a8302c', '#5e1614'] }],
  },
});
