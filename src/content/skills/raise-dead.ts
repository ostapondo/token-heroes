import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'raise-dead',
  name: 'Raise Dead',
  evolved: 'Bone Wall',
  hero: 'necromancer',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 15,
  effects: [{ kind: SkillEffectKind.Shield, share: 1, seconds: 6 }],
  look: SkillLook.RaiseDead,
  color: '#52e0c4',
  icon: {
    rows: [
      '...dddddd...',
      '..dddddddd..',
      '.dddddddddd.',
      '.ddffddffdd.',
      '.ddffddffdd.',
      '.ddddkkdddd.',
      '..dddddddd..',
      '...dkdkdd...',
      '...dddddd...',
      '............',
      '.t..t..t..t.',
      't..t..t..t..',
    ],
    fixed: { d: '#e9e2cc', f: '#52e0c4', k: '#1f2a28', t: '#52e0c4' },
  },
});
