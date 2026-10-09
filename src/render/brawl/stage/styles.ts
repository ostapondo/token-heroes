import type { TextStyle } from './fx';

export const COLOR = {
  steel: '#ffffff',
  crit: '#ffe066',
  gold: '#ffd36a',
  holy: '#fff6d6',
  ember: '#ff5a1f',
  heal: '#7cc35b',
  wound: '#ff5b4a',
  player: '#6fe3ff',
  glitch: '#2af0ff',
  poison: '#5dff8a',
  charge: '#9fd6ff',
  frost: '#7cc8ff',
  soul: '#52e0c4',
  ward: '#96d2ff',
  evolved: '#c9a6ff',
} as const;

// Sizes are in world units, a little over twice the pixel arena's.
export const TEXT = {
  hit: { color: COLOR.steel, size: 20 },
  crit: { color: COLOR.crit, size: 28 },
  strike: { color: COLOR.player, size: 32 },
  ultimate: { color: COLOR.holy, size: 36 },
  heal: { color: COLOR.heal, size: 18 },
  burn: { color: COLOR.ember, size: 16, life: 0.6, rise: 20 },
  wound: { color: COLOR.wound, size: 20 },
  block: { color: COLOR.steel, size: 20 },
  levelUp: { color: COLOR.gold, size: 24, life: 1.3 },
  phantom: { color: COLOR.glitch, size: 24 },
  poison: { color: COLOR.poison, size: 22 },
  drain: { color: COLOR.charge, size: 22, life: 1.2 },
  praise: { color: COLOR.gold, size: 20, life: 1.4, rise: 24 },
  alarm: { color: COLOR.wound, size: 60, life: 1.3, rise: 12 },
  note: { color: COLOR.steel, size: 20, life: 1.3, rise: 12 },
  banner: { color: COLOR.gold, size: 44, life: 1.6, rise: 16 },
  skill: { color: COLOR.gold, size: 22, life: 1.1, rise: 18 },
} as const satisfies Record<string, TextStyle>;
