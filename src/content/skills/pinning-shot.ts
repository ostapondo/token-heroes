import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'pinning-shot',
  name: 'Pinning Shot',
  evolved: 'Ballista',
  hero: 'sentinel',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 12,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.8, reach: 5, spread: 0.5 },
    { kind: SkillEffectKind.Mark, share: 0.2, seconds: 4, reach: [0, 5, 5] },
  ],
  look: SkillLook.PinningShot,
  color: '#ff5b4a',
  icon: {
    rows: [
      '...rrrrrr...',
      '..r......r..',
      '.r..wwww..r.',
      'r..w....w..r',
      'r..w.rr.w..r',
      'ffssssssssst',
      'r..w.rr.w..r',
      'r..w....w..r',
      '.r..wwww..r.',
      '..r......r..',
      '...rrrrrr...',
      '............',
    ],
    fixed: { r: '#c2361a', w: '#ffffff', f: '#8d95a3', s: '#c08a4a', t: '#e8e8f0' },
  },
});
