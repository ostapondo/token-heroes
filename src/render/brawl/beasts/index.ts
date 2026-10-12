import type { BeastForm } from '@content';
import type { BeastRig } from './beast';
import { BLOB } from './blob';
import { CHAIN } from './chain';
import { CRAWLER } from './crawler';
import { FLOATER } from './floater';
import { FLYER } from './flyer';
import { QUAD } from './quad';

export const BEAST_RIGS: Readonly<Record<BeastForm, BeastRig>> = {
  wolf: QUAD,
  boar: QUAD,
  rat: QUAD,
  dragon: QUAD,
  spider: CRAWLER,
  scorpion: CRAWLER,
  beetle: CRAWLER,
  serpent: CHAIN,
  bat: FLYER,
  crow: FLYER,
  ghost: FLOATER,
  eye: FLOATER,
  skull: FLOATER,
  wraith: FLOATER,
  slime: BLOB,
  mushroom: BLOB,
  toad: BLOB,
  mimic: BLOB,
  shoggoth: BLOB,
};

export { strikeCurve, type BeastRig, type BeastState } from './beast';
