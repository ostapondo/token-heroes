import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'crusade',
  name: 'Crusade',
  evolved: 'Holy Lance',
  hero: 'templar',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 11,
  effects: [{ kind: SkillEffectKind.Hit, share: 1, reach: 5, spread: 0.6 }],
  look: SkillLook.Crusade,
  color: '#fff6d6',
  icon: {
    rows: [
      '.....dd.....',
      '.d...ww...d.',
      '..d..ww..d..',
      '.....ww.....',
      '.....ww.....',
      '.....ww.....',
      '.....ww.....',
      '...gggggg...',
      '.....ff.....',
      '.....ff.....',
      '....gggg....',
      '............',
    ],
    fixed: { d: '#fff6d6', w: '#e8e8f0', g: '#b9842f', f: '#6b4a2e' },
  },
});
