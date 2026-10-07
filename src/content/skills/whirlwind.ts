import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'whirlwind',
  name: 'Whirlwind',
  evolved: 'Blade Storm',
  hero: 'wanderer',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 10,
  effects: [{ kind: SkillEffectKind.Hit, share: 1, reach: [2, 4, 5], spread: 0.4 }],
  look: SkillLook.Whirlwind,
  color: '#e8e8f0',
  icon: {
    rows: [
      '....ddddd...',
      '..dd.....d..',
      '.d.......sw.',
      '.d......sws.',
      'd......sws..',
      'd.....sws..d',
      '.....sws...d',
      '..fksws...d.',
      '..ffs....d..',
      '.ffk....d...',
      'ff...ddd....',
      '............',
    ],
    fixed: { d: '#9fd6ff', s: '#8d95a3', w: '#ffffff', f: '#8a6a4a', k: '#e8b23a' },
  },
});
