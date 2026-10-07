// A backdrop is painted far to near: sky bands, then each piece of scenery in order.
export const SceneryKind = {
  Stars: 'stars',
  Orb: 'orb',
  Aurora: 'aurora',
  Clouds: 'clouds',
  Overcast: 'overcast',
  Rays: 'rays',
  Ridge: 'ridge',
  Peaks: 'peaks',
  Volcano: 'volcano',
  Mesas: 'mesas',
  Shards: 'shards',
  Canopy: 'canopy',
  Trees: 'trees',
  Chapel: 'chapel',
  Graves: 'graves',
  Fence: 'fence',
  Cathedral: 'cathedral',
  Ziggurat: 'ziggurat',
  Colonnade: 'colonnade',
  Hoard: 'hoard',
  Monoliths: 'monoliths',
  Ruins: 'ruins',
  HorizonLine: 'horizon-line',
  Cracks: 'cracks',
  Litter: 'litter',
  Pools: 'pools',
  Furrows: 'furrows',
  Tiles: 'tiles',
  Flagstones: 'flagstones',
  Reflection: 'reflection',
} as const;
export type SceneryKind = (typeof SceneryKind)[keyof typeof SceneryKind];

export const LitterShape = {
  Pebble: 'pebble',
  Crack: 'crack',
  Tuft: 'tuft',
  Reed: 'reed',
  Bone: 'bone',
  Skull: 'skull',
  Coin: 'coin',
  Sparkle: 'sparkle',
} as const;
export type LitterShape = (typeof LitterShape)[keyof typeof LitterShape];

export const PoolMotion = { Ripples: 'ripples', Bubbles: 'bubbles' } as const;
export type PoolMotion = (typeof PoolMotion)[keyof typeof PoolMotion];

type Color = string;
type List<T> = readonly T[];
type Peak = readonly [x: number, height: number, slope: number];
type Block = readonly [x: number, width: number, height: number];
type Halo = readonly [inner: number, outer: number, color: Color, strength: number];
type Disc = readonly [radius: number, color: Color, dx: number, dy: number];
type Spot = readonly [dx: number, dy: number, radius: number];
type Of<K extends SceneryKind, Data> = { readonly kind: K } & Readonly<Data>;

export type SceneryDef =
  | Of<
      'stars',
      { count: number; colors: List<Color>; below: number; twinkle: number; flash: Color }
    >
  | Of<
      'orb',
      {
        lift?: number;
        halos: List<Halo>;
        corona?: { color: Color; glint: Color };
        discs: List<Disc>;
        spots?: { color: Color; at: List<Spot> };
      }
    >
  | Of<'aurora', { ribbons: List<readonly [top: number, color: Color, speed: number]> }>
  | Of<'clouds', { top: number; thick: number; body: Color; lit: Color }>
  | Of<'overcast', { body: Color; rim: Color; shade: Color; curtain: Color }>
  | Of<'rays', { color: Color; shafts: List<readonly [start: number, width: number]> }>
  | Of<
      'ridge',
      {
        base: number;
        amplitude: number;
        roughness: number;
        color: Color;
        rim?: Color;
        glow?: Color;
      }
    >
  | Of<
      'peaks',
      { peaks: List<Peak>; color: Color; rim?: Color; snow?: { cap: Color; line: Color } }
    >
  | Of<
      'volcano',
      {
        peak: Peak;
        color: Color;
        rim: Color;
        glow: Color;
        crater: readonly [Color, Color];
        lava: readonly [Color, Color];
      }
    >
  | Of<
      'mesas',
      {
        mesas: List<readonly [left: number, right: number, height: number]>;
        color: Color;
        rim: Color;
        strata: Color;
      }
    >
  | Of<
      'shards',
      {
        shards: List<readonly [x: number, height: number, half: number]>;
        lit: Color;
        shade: Color;
        edge: Color;
        tip: Color;
      }
    >
  | Of<'canopy', { color: Color; rim: Color }>
  | Of<'trees', { trees: List<readonly [x: number, height: number]>; color: Color; moss?: Color }>
  | Of<'chapel', { x: number; color: Color; window: Color; door: Color }>
  | Of<
      'graves',
      {
        tombs: List<Block>;
        crosses: List<readonly [x: number, height: number]>;
        color: Color;
        rim: Color;
      }
    >
  | Of<
      'fence',
      {
        from: number;
        to: number;
        step: number;
        height: number;
        rails: List<number>;
        color: Color;
        tip?: Color;
        spear?: boolean;
      }
    >
  | Of<'cathedral', { x: number; color: Color; glass: Color; rose: readonly [Color, Color] }>
  | Of<'ziggurat', { x: number; color: Color; shade: Color; edge: Color; door: Color }>
  | Of<'colonnade', { x: number; color: Color; cap: Color; edge: Color }>
  | Of<
      'hoard',
      {
        mounds: List<readonly [x: number, radius: number, height: number]>;
        color: Color;
        rim: Color;
        glint: Color;
        sparkle: Color;
      }
    >
  | Of<'monoliths', { monoliths: List<Block>; color: Color; rim: Color; rimFar: Color }>
  | Of<'ruins', { ruins: List<Block>; color: Color; rim: Color }>
  | Of<'horizon-line', { color: Color }>
  | Of<
      'cracks',
      { count: number; color: Color; glow: Color; hot: Color; warm: Color; bubble: Color }
    >
  | Of<'litter', { shape: LitterShape; count: number; minDepth: number; colors: List<Color> }>
  | Of<
      'pools',
      {
        count: number;
        size: number;
        minDepth: number;
        fill: Color;
        rim: Color;
        shine: Color;
        motion?: { kind: PoolMotion; color: Color };
      }
    >
  | Of<
      'furrows',
      {
        rows: number;
        wave: number;
        tighten: number;
        threshold: number;
        color: Color;
        shade?: Color;
      }
    >
  | Of<'tiles', { rows: number; spacing: number; line: Color; shine?: Color }>
  | Of<'flagstones', { rows: number; spacing: number; joint: Color }>
  | Of<'reflection', { color: Color }>;

// Depth runs from 0 at the horizon to 1 at the bottom edge of the arena.
export interface BackdropDef {
  readonly seed: number;
  readonly sky: readonly Color[];
  readonly ground: readonly Color[];
  readonly pool?: number;
  readonly scenery: readonly SceneryDef[];
}
