import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'snipe',
  name: 'Snipe',
  evolved: 'Deadeye',
  hero: 'archer',
  slot: 2,
  trigger: SkillTrigger.Cooldown,
  cooldown: 15,
  charge: 1.2,
  effects: [{ kind: SkillEffectKind.Hit, share: 1, reach: [0, 5, 5], spread: 0.35 }],
  look: SkillLook.Snipe,
  color: '#ff5b4a',
  icon: {
    rows: [
      '....rrrr....',
      '..rr.ww.rr..',
      '.r...ww...r.',
      '.r...ww...r.',
      'r.........r.',
      'rwww.dd.wwwr',
      'rwww.dd.wwwr',
      'r..........r',
      '.r...ww...r.',
      '.r...ww...r.',
      '..rr.ww.rr..',
      '....rrrr....',
    ],
    fixed: { r: '#c2361a', w: '#ffffff', d: '#ff5b4a' },
  },
});
