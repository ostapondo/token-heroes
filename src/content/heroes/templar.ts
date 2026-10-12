import { AttackStyle, HeroRole } from '@engine';
import { defineHero } from '../model/definitions';
import { Stance } from '../model/look';

export default defineHero({
  id: 'templar',
  name: 'Templar',
  order: 12,
  role: HeroRole.Tank,
  attack: AttackStyle.Slash,
  attackInterval: 1.1,
  focus: 0.1,
  tint: '#efe6d4',
  look: {
    rig: 'biped',
    mass: 1.5,
    metal: true,
    stance: Stance.Guard,
    build: { shoulders: 7.2 },
    colors: {
      upper: ['#d5dce6', '#6f7b8c'],
      fore: ['#d5dce6', '#6f7b8c'],
      hand: ['#d5dce6', '#6f7b8c'],
      thigh: ['#8e98a8', '#4f5868'],
      shin: ['#d5dce6', '#6f7b8c'],
      boot: ['#5a6474', '#2c323c'],
      torso: ['#d5dce6', '#6f7b8c'],
    },
    head: { form: 'helm', shape: 'great', metal: ['#c9d1dc', '#6f7b8c'], visor: '#101218' },
    details: [{ kind: 'tabard', color: ['#efe6d4', '#a89e8a'], emblem: ['#c2361a', '#6e1a0c'] }],
    weapon: { kind: 'sword', length: 28, blade: ['#eef2f6', '#8a96a6'] },
    offhand: { kind: 'kite', color: ['#efe6d4', '#a89e8a'], emblem: ['#c2361a', '#6e1a0c'] },
    cloth: [{ at: 'back', length: 20, width: 7.5, color: ['#efe6d4', '#a89e8a'] }],
  },
});
