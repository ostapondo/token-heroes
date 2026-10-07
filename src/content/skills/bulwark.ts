import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'bulwark',
  name: 'Bulwark',
  evolved: 'Aegis',
  hero: 'shieldbearer',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 12,
  effects: [{ kind: SkillEffectKind.Shield, share: 1, seconds: [3, 4, 5] }],
  look: SkillLook.Bulwark,
  color: '#e8b23a',
  icon: {
    rows: [
      '.gggggggggg.',
      'gyyyyyyyyyyg',
      'gyyyyddyyyyg',
      'gyyyyddyyyyg',
      'gyyddddddyyg',
      'gyyddddddyyg',
      'gyyyyddyyyyg',
      '.gyyyddyyyg.',
      '.gyyyyyyyyg.',
      '..gyyyyyyg..',
      '...gyyyyg...',
      '....gggg....',
    ],
    fixed: { g: '#8a5e14', y: '#e8b23a', d: '#fff3c4' },
  },
});
