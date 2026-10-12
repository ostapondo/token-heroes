import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'shieldbearer',
  name: 'Shieldbearer',
  order: 3,
  role: HeroRole.Tank,
  attack: AttackStyle.Bash,
  attackInterval: 1.4,
  tint: '#b9842f',
  look: {
    rig: 'biped',
    mass: 1.6,
    metal: true,
    stance: Stance.Guard,
    build: { shoulders: 7.6, hips: 6, arm: 3.6, forearm: 3.2, leg: 4.2 },
    colors: {
      upper: ['#8d95a3', '#4a505c'],
      fore: ['#8d95a3', '#4a505c'],
      hand: ['#5e6675', '#2e333c'],
      thigh: ['#3a3f4a', '#1c2028'],
      shin: ['#8d95a3', '#4a505c'],
      boot: ['#3a3f4a', '#1c2028'],
      torso: ['#8d95a3', '#4a505c'],
    },
    head: {
      form: 'helm',
      shape: 'bucket',
      metal: ['#8d95a3', '#4a505c'],
      visor: '#1a1a22',
      crest: '#f2c14e',
    },
    details: [
      { kind: 'belt', color: '#b9842f' },
      { kind: 'pauldron', color: ['#9aa2b0', '#4a505c'] },
    ],
    weapon: { kind: 'mace', color: ['#c9ced6', '#5e6675'] },
    offhand: {
      kind: 'tower',
      rim: ['#b9842f', '#6a4614'],
      face: ['#3a3f4a', '#1c2028'],
      boss: ['#f2c14e', '#9a6a14'],
    },
  },
});
