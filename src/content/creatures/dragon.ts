import { defineCreature } from '../model/definitions';

export default defineCreature({
  id: 'dragon',
  name: 'Dragon',
  attack: 'breath',
  hpScale: 1.3,
  damageScale: 1.2,
  sprite: {
    rows: [
      '....................',
      '....h........bb.....',
      '..h.h.......bbbb....',
      '.aaaa......bbbbb....',
      '.aeaa.....bbbbbb....',
      'aaaaaaa..bbbbbbb....',
      'xxxaaaa..bbbbbb.....',
      '.....aaaaaaaaaa.....',
      '.....ccaaaaaaaa.....',
      '.......aaaaaaaa.....',
      '.......aaaaaaaaaa...',
      '.......accccccaaaaa.',
      '........bb...bb....b',
      '........bb...bb.....',
      '........bb...bb.....',
      '.......bbb..bbb.....',
    ],
  },
});
