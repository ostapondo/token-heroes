import { SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';

export default defineSuperBoss({
  id: 'sycophant',
  name: 'Sycophant',
  tier: SuperBossTier.Medium,
  order: 4,
  lair: LairId.Court,
  attack: CreatureAttack.Lunge,
  hpScale: 1.5,
  damageScale: 0.8,
  palette: { a: '#d84a8a', b: '#8a2a5a', c: '#ffc8dc', e: '#2a1408', h: '#ffd36a', x: '#2a0a1a' },
  sprite: {
    rows: [
      '.h............h.....',
      '.q............a.....',
      '.qq..........aa.....',
      '..qq........aaa.....',
      '...qqq....aaaa......',
      '....qqqqaaaaa.......',
      '...hhhhhhhhhh.......',
      '..hhhhhhhhhhhw......',
      '..hhehhhehhhwwqqqa..',
      '..hehehehehhwqqqaaa.',
      '..phhhhhhphhwqqqaaaa',
      '..hkwwwwwkhwqqqqaaaa',
      '..hhkwwwkhhwqqqqaaaa',
      '...hhkkkhhwqqqqqaaa.',
      '....hhhhhwqqqqqaaaa.',
      '.......qqqqqqqqaaa..',
      '.....cqqq...qqq.aaa.',
      '....ccc.....qqq.aaa.',
      '.....c......qq...aa.',
      '............qq...aa.',
      '..........qqqq..aaa.',
      '.........qq....aaaa.',
    ],
    fixed: { q: '#2ac0b0', g: '#c89020', w: '#fff6e0', k: '#5a1a10', p: '#ff8a8a' },
  },
});
