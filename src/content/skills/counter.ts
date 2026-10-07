import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'counter',
  name: 'Counter',
  evolved: 'Iron Palm',
  hero: 'monk',
  slot: 1,
  trigger: SkillTrigger.OnGuard,
  chance: 0.25,
  effects: [
    { kind: SkillEffectKind.Deflect },
    { kind: SkillEffectKind.Hit, share: 1, reach: [0, 0, 5], spread: 0.3 },
  ],
  look: SkillLook.Counter,
  color: '#ffd36a',
  icon: {
    rows: [
      '..f.f.f.....',
      '..f.f.f.f...',
      '..f.f.f.f...',
      '..fffffff...',
      'f.fffffff.y.',
      'fffffffff..y',
      '.ffffffff.y.',
      '..fffffff...',
      '...fffff..y.',
      '...fffff...y',
      '...sssss..y.',
      '...sssss....',
    ],
    fixed: { f: '#e7b48f', s: '#e8862a', y: '#ffd36a' },
  },
});
