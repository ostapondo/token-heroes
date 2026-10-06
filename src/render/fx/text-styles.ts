import { FX_COLOR } from './colors';
import type { TextStyle } from './floating-text';

export const TEXT = {
  hit: { color: FX_COLOR.steel, size: 10 },
  crit: { color: FX_COLOR.crit, size: 14 },
  strike: { color: FX_COLOR.player, size: 16 },
  ultimate: { color: FX_COLOR.holy, size: 18 },
  heal: { color: FX_COLOR.heal, size: 9 },
  wound: { color: FX_COLOR.wound, size: 11 },
  levelUp: { color: FX_COLOR.gold, size: 11, life: 1.3 },
} as const satisfies Record<string, TextStyle>;
