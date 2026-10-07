import { SuperBossTier } from '@engine';
import { CreatureAttack, defineSuperBoss } from '../model/definitions';
import { LairId } from '../model/ids';

export default defineSuperBoss({
  id: 'hallucinator',
  name: 'Hallucinator',
  tier: SuperBossTier.Medium,
  order: 2,
  lair: LairId.Mirage,
  attack: CreatureAttack.Spit,
  hpScale: 0.9,
  damageScale: 1.35,
  palette: { a: '#c04ad8', b: '#7a2a9a', c: '#ffb0ff', e: '#ffffff', h: '#5ef0ff', x: '#1a0830' },
  sprite: {
    rows: [
      '.......cccccc.......',
      '.....ccaaaaaacc.....',
      '...ccaaaaaaaaaacc...',
      '..caaaeeaaaaaaaaac..',
      '..caaaxeaaaahhaaac..',
      '.caaaaaaaaaahhaaaac.',
      '.caeeaaaeeeeaaaaaac.',
      '.caxeaaexxxxeaaeeac.',
      '.caaaaaexxxxeaaxeac.',
      '.chhaaaaeeeeaaaaaac.',
      '.cbaaaaaaaaaaaaaabc.',
      '..bbabbabbabbabbab..',
      '..ab..ab..ab..ab.ab.',
      '..ab...ab.ab..ab.ab.',
      '...ab..ab..ab.ab..ab',
      '...ab.ab...ab..ab.ab',
      '..ab..ab..ab...ab.ab',
      '..ab...ab.ab..ab..h.',
      '...ab..ab..ab.ab..h.',
      '...h..ab...ab..h....',
      '...h..h.....h..h....',
      '......h.....h.......',
    ],
  },
});
