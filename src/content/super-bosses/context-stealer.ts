import { SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';

export default defineSuperBoss({
  id: 'context-stealer',
  name: 'Context Stealer',
  tier: SuperBossTier.Medium,
  order: 1,
  lair: LairId.Archive,
  attack: CreatureAttack.Lunge,
  hpScale: 1.0,
  damageScale: 1.2,
  palette: { a: '#4a3c96', b: '#2c2360', c: '#8a7ae0', e: '#7dfcff', h: '#d8d0f0', x: '#120d2a' },
  sprite: {
    rows: [
      '...........ttt.tt...',
      '....................',
      '............tt.ttt..',
      '.......bb.....rrr...',
      '......baab...ksssk..',
      '.....baaaab.ksssssk.',
      '....baaaaaabsssssssk',
      '...cvvvvaaabsssssssk',
      '...cvevebaabsspssssk',
      '...cvevebaabspppsssk',
      '...cvvvvaaabsspssssk',
      '....baaaaaabssssssk.',
      'ttthhbaaaaaabsssskk.',
      '..hbbbaaaaaab.kkkk..',
      '....cbaaaaaaab......',
      '....cbaaaaaaab......',
      '....cbaaaaaaaab.....',
      '...cbaaaaaaaaab.....',
      '...cbaaaaaaaaaab....',
      '..cbaaaaaaaaaaab....',
      '..cab.bab.bab.ab....',
      '..b....b...b...b....',
    ],
    fixed: { v: '#05040c', s: '#9a7646', k: '#5e4626', p: '#c09a5a', r: '#e0c890', t: '#ffd36a' },
  },
});
