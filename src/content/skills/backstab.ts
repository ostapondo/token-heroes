import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'backstab',
  name: 'Backstab',
  evolved: 'Shadow Dance',
  hero: 'rogue',
  slot: 1,
  trigger: SkillTrigger.OnHit,
  chance: 0.15,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.85, reach: [0, 0, 2], spread: 0.5 },
    { kind: SkillEffectKind.Burn, share: 0.15, seconds: 2 },
  ],
  look: SkillLook.Backstab,
  color: '#c46bff',
  icon: {
    rows: [
      'p...........',
      '.p..........',
      '..ss........',
      '..sws.......',
      '...sws......',
      '....sws.....',
      '.....sws....',
      '......swk.k.',
      '.......kkd..',
      '......k.ddd.',
      '.........ddd',
      '..........d.',
    ],
    fixed: { p: '#c46bff', s: '#c9d1d9', w: '#ffffff', k: '#3a3f36', d: '#6b4a2e' },
  },
});
