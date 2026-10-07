import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'call-lightning',
  name: 'Call Lightning',
  evolved: 'Thunderstorm',
  hero: 'druid',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 14,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.8, reach: [1, 3, 3], spread: 0.5 },
    { kind: SkillEffectKind.Stun, share: 0.2, reach: [1, 3, 3] },
  ],
  look: SkillLook.CallLightning,
  color: '#8fc7ff',
  icon: {
    rows: [
      '......dddd..',
      '.....wddd...',
      '....wddd....',
      '...wddd.....',
      '..wddddddd..',
      '......wdd...',
      '.....wdd....',
      '....wdd.....',
      '...wd.......',
      '..wd........',
      '.wd.........',
      '............',
    ],
    fixed: { d: '#8fc7ff', w: '#ffffff' },
  },
});
