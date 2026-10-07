import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'justice',
  name: 'Justice',
  evolved: 'Wrath',
  hero: 'paladin',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 13,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.6 },
    { kind: SkillEffectKind.Stun, share: 0.4, reach: [0, 0, 5] },
  ],
  look: SkillLook.Justice,
  color: '#e8b23a',
  icon: {
    rows: [
      '.gggggggg...',
      'gyyyyyyyyg..',
      'gyddyyyyyg..',
      'gyyyyyyyyg..',
      '.gggffggg...',
      '....ff......',
      '....ff......',
      '....ff......',
      '....ff......',
      '....ff......',
      '...pppp.....',
      '....pp......',
    ],
    fixed: { g: '#8a5e14', y: '#e8b23a', d: '#fff3c4', f: '#6b4a2e', p: '#fff6d6' },
  },
});
