import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'leap-slam',
  name: 'Leap Slam',
  evolved: 'Earthsplitter',
  hero: 'barbarian',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 12,
  effects: [
    { kind: SkillEffectKind.Hit, share: 0.8, reach: 5, spread: 0.4 },
    { kind: SkillEffectKind.Stun, share: 0.2, reach: 5 },
  ],
  look: SkillLook.LeapSlam,
  color: '#c06a2a',
  icon: {
    rows: [
      '...ffff.....',
      '..ffffff....',
      '..fsfsff....',
      '..ffffff....',
      '...ffff.....',
      '....ii......',
      '.d........d.',
      '..d..dd..d..',
      'gggggggggggg',
      'g.gg.jjg.gg.',
      '.g..j..jg..g',
      '...j.....j..',
    ],
    fixed: { f: '#e7b48f', s: '#c08a4a', i: '#c06a2a', d: '#c9ced6', g: '#5a4632', j: '#1a1206' },
  },
});
