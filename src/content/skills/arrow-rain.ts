import { SkillEffectKind, SkillTrigger } from '@engine';
import { defineSkill, SkillLook } from '../model/skill';

export default defineSkill({
  id: 'arrow-rain',
  name: 'Arrow Rain',
  evolved: 'Starfall',
  hero: 'archer',
  slot: 1,
  trigger: SkillTrigger.Cooldown,
  cooldown: 12,
  effects: [{ kind: SkillEffectKind.Hit, share: 1, reach: 5, spread: 0.35 }],
  look: SkillLook.ArrowRain,
  color: '#c8f08a',
  icon: {
    rows: [
      '.....f......',
      '....fsf.....',
      '.f...s...f..',
      'fsf..s..fsf.',
      '.s...s...s..',
      '.s..ttt..s..',
      '.s...t...s..',
      '.s......ttt.',
      'ttt......t..',
      '.t..........',
      'gggggggggggg',
      '.g.g.g.g.g.g',
    ],
    fixed: { f: '#8fd14f', s: '#c08a4a', t: '#e8e8f0', g: '#5a4632' },
  },
});
