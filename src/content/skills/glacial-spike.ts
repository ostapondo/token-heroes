import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'glacial-spike',
  name: 'Glacial Spike',
  evolved: 'Blizzard',
  hero: 'frost-witch',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 12,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.8, reach: [0, 5, 5], spread: 0.4 },
    { kind: SkillEffectKind.Stun, share: 0.2, reach: [0, 5, 5] },
  ],
  look: SkillLook.GlacialSpike,
  color: '#7fc8ef',
  icon: {
    rows: [
      '.....w......',
      '.....wf.....',
      '....wff.....',
      '....wff...w.',
      '.w..wfff..wf',
      '.wf.wfff.wff',
      'wff.wfff.wff',
      'wfffwffffwff',
      'wfffwffffwff',
      'dddddddddddd',
      '.d.d.d.d.d.d',
      '............',
    ],
    fixed: { w: '#ffffff', f: '#7fc8ef', d: '#2a6f9e' },
  },
});
