import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'golem',
  name: 'Golem',
  attack: 'slam',
  hpScale: 1.6,
  damageScale: 0.8,
  sprite: {
    rows: [
      '.......cc.......',
      '.....aaaaaa.....',
      '..c..aeaaea..c..',
      '.cc..aaaaaa..cc.',
      '.ccaaaaaaaaaacc.',
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaeeaaaaaaa',
      'aaaaaaeaaaaaaaaa',
      'aaaaaaeaaeaaaaaa',
      'aaaaaaaaaeaaaaaa',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
      '...aaaa..aaaa...',
    ],
  },
});
