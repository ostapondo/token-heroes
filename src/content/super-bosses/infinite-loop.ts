import { SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';

export default defineSuperBoss({
  id: 'infinite-loop',
  name: 'Infinite Loop',
  tier: SuperBossTier.Strong,
  order: 2,
  lair: LairId.Recursion,
  attack: CreatureAttack.Slam,
  hpScale: 1.2,
  damageScale: 1.0,
  palette: { a: '#3ad06a', b: '#1f8a40', c: '#a8ffb8', e: '#ffe14a', h: '#eef4ee', x: '#08200f' },
  sprite: {
    rows: [
      '....baaab...........',
      '..baaaaaaab.........',
      '.baeeaaaaaaaaa......',
      'baaaaaacaaaaaaaa....',
      'hhxxxxaaaaaaaaaaa...',
      '.hcxxbaaaa...aaaaa..',
      '..cahbaa......aaaaa.',
      '..caa..........aaaa.',
      '..caa..........abaa.',
      '.caaa..........aaaa.',
      '.caa.....eee...aaba.',
      '.caa....e...e..aaaa.',
      'caaa...e.....e.aaaab',
      'caa....e.....e..abab',
      'caa....e....eee.aaab',
      'caaa...e.....e.aaaab',
      '.caa....e.......abab',
      '.caa.....eee...aaab.',
      '.caaa.........aaaab.',
      '.caaa.........abaab.',
      '..caaa.......aaaab..',
      '..cbaaaa...aaaaabb..',
      '...bbaaaaaaaaaabb...',
      '....bbbaaaaaabbb....',
      '......bbbbbbbb......',
    ],
  },
});
