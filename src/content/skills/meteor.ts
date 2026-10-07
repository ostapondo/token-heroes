import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'meteor',
  name: 'Meteor',
  evolved: 'Meteor Shower',
  hero: 'fire-mage',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 14,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.8, reach: [0, 1, 2], spread: 0.5 },
    { kind: SkillEffectKind.Burn, share: 0.2, seconds: 3, reach: [0, 1, 2] },
  ],
  look: SkillLook.Meteor,
  color: '#ff8a3a',
  icon: {
    rows: [
      '..........yy',
      '.........yo.',
      '........yoo.',
      '.......yoo..',
      '......yoo...',
      '..rrr.oo....',
      '.rdddro.....',
      'rddfddr.....',
      'rdfdddr.....',
      'rdddddr.....',
      '.rdddr......',
      '..rrr.......',
    ],
    fixed: { y: '#ffd36a', o: '#ff8a3a', r: '#ff5a1f', d: '#7a2f12', f: '#ffd36a' },
  },
});
