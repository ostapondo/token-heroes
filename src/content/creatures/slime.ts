import { CreatureAttack, defineCreature } from '../model/definitions';
import { CreatureId } from '../model/ids';

export default defineCreature({
  id: CreatureId.Slime,
  name: 'Slime',
  attack: CreatureAttack.Slam,
  hpScale: 1.4,
  damageScale: 0.7,
  sprite: {
    rows: [
      '................',
      '.....m.mm.m.....',
      '.....mmrrmm.....',
      '.....mmmmmm.....',
      '.....aaaaaa.....',
      '....aaaaaaaa....',
      '...aaccaaaaaa...',
      '...acaaaaaaaa...',
      '...aaaaaaaaaa...',
      '..aaakxaakxaaa..',
      '..aaaxxaaxxaaa..',
      '..baaaaaaaaaaa..',
      '..baaaaxxaaaaa..',
      '..bbbbbbbbbbbb..',
      '................',
      '................',
    ],
    fixed: { k: '#ffffff', m: '#dfe3e8', r: '#c2361a' },
  },
});
