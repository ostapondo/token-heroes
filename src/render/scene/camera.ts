import { ARENA, type Point } from './geometry';

export const CameraId = { Close: 'close', Wide: 'wide' } as const;
export type CameraId = (typeof CameraId)[keyof typeof CameraId];

interface PartyFrame {
  readonly front: number;
  readonly rows: readonly number[];
  readonly depth: number;
  readonly columns: number;
  readonly pitch: number;
  readonly stagger: number;
  readonly lineGap: number;
  readonly lineRise: number;
}

interface PackFrame {
  readonly spacing: number;
  readonly feet: readonly [front: number, back: number];
  readonly backShift: number;
}

export interface Camera {
  readonly id: CameraId;
  readonly scale: { readonly hero: number; readonly enemy: number; readonly boss: number };
  readonly party: PartyFrame;
  readonly pack: PackFrame;
}

// Fourteen heroes at 3x need twice the room the party has, so no layout keeps them apart. The
// close camera holds a small party at 3x; the wide one draws every sprite one step smaller,
// which shrinks the pack too and gives the party the ground up to x 106. Scales stay whole so
// every pixel stays square. Rows 12 px apart keep the face of the hero behind in view at 2x.
export const CAMERAS: Readonly<Record<CameraId, Camera>> = {
  [CameraId.Close]: {
    id: CameraId.Close,
    scale: { hero: 3, enemy: 3, boss: 4 },
    party: {
      front: 86,
      rows: [ARENA.height - 10, ARENA.height - 24],
      depth: 2,
      columns: 4,
      pitch: 20,
      stagger: 4,
      lineGap: 0,
      lineRise: 0,
    },
    pack: { spacing: 32, feet: [ARENA.height - 10, ARENA.height - 22], backShift: 8 },
  },
  [CameraId.Wide]: {
    id: CameraId.Wide,
    scale: { hero: 2, enemy: 2, boss: 3 },
    party: {
      front: 106,
      rows: [ARENA.height - 6, ARENA.height - 18, ARENA.height - 30, ARENA.height - 42],
      depth: 3,
      columns: 7,
      pitch: 15,
      stagger: 5,
      lineGap: 4,
      lineRise: 3,
    },
    pack: { spacing: 24, feet: [ARENA.height - 6, ARENA.height - 18], backShift: 6 },
  },
};

// When the camera pulls back the scene shrinks toward the foes' corner; then every hero walks
// from where it shrank to its new place.
export const PULLBACK = { seconds: 0.6, pivot: { x: ARENA.width, y: ARENA.height - 4 } } as const;

export const pulledBack = (point: Point, ratio: number): Point => ({
  x: PULLBACK.pivot.x + (point.x - PULLBACK.pivot.x) * ratio,
  y: PULLBACK.pivot.y + (point.y - PULLBACK.pivot.y) * ratio,
});
