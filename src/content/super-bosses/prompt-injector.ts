import { SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';

export default defineSuperBoss({
  id: 'prompt-injector',
  name: 'Prompt Injector',
  tier: SuperBossTier.Medium,
  order: 3,
  lair: LairId.Mire,
  attack: CreatureAttack.Spit,
  hpScale: 0.95,
  damageScale: 1.25,
  palette: { a: '#5a6a7a', b: '#36404c', c: '#d8e4ee', e: '#ff3b5c', h: '#e8eef4', x: '#14181e' },
  sprite: {
    rows: [
      '............w.......',
      '...........ww....w..',
      '..........www...ww..',
      '.........www...www..',
      '........www...www...',
      '.........w...ww....h',
      '.....aaa.cxcxcxcxc.h',
      '....eeaaacggggggwchh',
      'hhhheeaaacgdddddwchh',
      'g...aaaaacggggggwchh',
      '.....bbb.cccccccccch',
      '.....b..b..b..b....h',
      '....b...b...b..b....',
      '...b....b....b..b...',
      '..b.....b....b...b..',
      '..b....b......b..b..',
      '.b.....b......b...b.',
      '.b.....b.......b..b.',
      '.b....b........b...b',
      'b.....b........b...b',
      'b.....b.........b..b',
      'b....b..........b..b',
    ],
    fixed: { w: '#c8f0ff', g: '#5dff8a', d: '#1fa850' },
  },
});
