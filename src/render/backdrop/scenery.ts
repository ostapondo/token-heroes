import { SceneryKind, type BackdropDef, type SceneryDef } from '@content';
import { cracks, litter, pools } from './ground';
import { flagstones, furrows, horizonLine, reflection, tiles } from './floor';
import { canopy, mesas, peaks, ridge, shards, trees, volcano } from './landforms';
import { Pixels } from './pixels';
import { BOTTOM, WIDTH, paintBands, type Animation } from './plane';
import { aurora, clouds, orb, overcast, rays, stars } from './sky';
import {
  cathedral,
  chapel,
  colonnade,
  fence,
  graves,
  hoard,
  monoliths,
  ruins,
  ziggurat,
} from './structures';
import { seededRandom } from './tone';

export interface PaintedScenery {
  readonly pixels: Pixels;
  readonly animations: readonly Animation[];
}

const SEED_STRIDE = 7919;

// Paints the still backdrop once; what moves comes back as animations drawn every frame.
export function paintScenery(backdrop: BackdropDef): PaintedScenery {
  const pixels = new Pixels(WIDTH, BOTTOM);

  paintBands(pixels, backdrop);
  const animations = backdrop.scenery.flatMap((piece, index) => {
    const animation = paintPiece(pixels, piece, seededRandom(backdrop.seed * SEED_STRIDE + index));

    return animation ? [animation] : [];
  });

  return { pixels, animations };
}

function paintPiece(p: Pixels, piece: SceneryDef, random: () => number): Animation | null {
  switch (piece.kind) {
    case SceneryKind.Stars:
      return stars(p, piece, random);
    case SceneryKind.Aurora:
      return aurora(piece);
    case SceneryKind.Hoard:
      return hoard(p, piece, random);
    case SceneryKind.Cracks:
      return cracks(p, piece, random);
    case SceneryKind.Litter:
      return litter(p, piece, random);
    case SceneryKind.Pools:
      return pools(p, piece, random);
    case SceneryKind.Orb:
      orb(p, piece);
      break;
    case SceneryKind.Clouds:
      clouds(p, piece, random);
      break;
    case SceneryKind.Overcast:
      overcast(p, piece);
      break;
    case SceneryKind.Rays:
      rays(p, piece);
      break;
    case SceneryKind.Ridge:
      ridge(p, piece, random);
      break;
    case SceneryKind.Peaks:
      peaks(p, piece, random);
      break;
    case SceneryKind.Volcano:
      volcano(p, piece, random);
      break;
    case SceneryKind.Mesas:
      mesas(p, piece, random);
      break;
    case SceneryKind.Shards:
      shards(p, piece);
      break;
    case SceneryKind.Canopy:
      canopy(p, piece);
      break;
    case SceneryKind.Trees:
      trees(p, piece, random);
      break;
    case SceneryKind.Chapel:
      chapel(p, piece);
      break;
    case SceneryKind.Graves:
      graves(p, piece);
      break;
    case SceneryKind.Fence:
      fence(p, piece);
      break;
    case SceneryKind.Cathedral:
      cathedral(p, piece);
      break;
    case SceneryKind.Ziggurat:
      ziggurat(p, piece);
      break;
    case SceneryKind.Colonnade:
      colonnade(p, piece);
      break;
    case SceneryKind.Monoliths:
      monoliths(p, piece);
      break;
    case SceneryKind.Ruins:
      ruins(p, piece, random);
      break;
    case SceneryKind.HorizonLine:
      horizonLine(p, piece);
      break;
    case SceneryKind.Furrows:
      furrows(p, piece);
      break;
    case SceneryKind.Tiles:
      tiles(p, piece);
      break;
    case SceneryKind.Flagstones:
      flagstones(p, piece);
      break;
    case SceneryKind.Reflection:
      reflection(p, piece);
      break;
    default:
      return unknownPiece(piece);
  }

  return null;
}

function unknownPiece(piece: never): never {
  throw new Error(`No scenery paints ${JSON.stringify(piece)}`);
}
