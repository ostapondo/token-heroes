import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'sanctuary',
  name: 'Sanctuary',
  evolved: 'Radiance',
  hero: 'cleric',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 11,
  effects: [{ kind: SkillEffectKind.Heal, share: 1 }],
  look: SkillLook.Sanctuary,
  color: '#9be37a',
  icon: {
    rows: [
      '....d..d....',
      '.d..gggg..d.',
      '....gwwg....',
      '....gwwg....',
      'gggggwwggggg',
      'gwwwwwwwwwwg',
      'gwwwwwwwwwwg',
      'gggggwwggggg',
      '....gwwg....',
      '....gwwg....',
      '.d..gggg..d.',
      '....d..d....',
    ],
    fixed: { g: '#3d7a3a', w: '#9be37a', d: '#fff6d6' },
  },
});
