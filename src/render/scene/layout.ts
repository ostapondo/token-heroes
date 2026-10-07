import type { Camera } from './camera';
import { ARENA, type Box } from './geometry';

const PACK = { right: ARENA.width - 4, perRow: 3 } as const;
const BOSS = { margin: 10, feet: ARENA.height - 10 } as const;

interface Size {
  readonly width: number;
  readonly height: number;
}

export function packSlot(index: number, size: Size, camera: Camera): Box {
  const { spacing, feet, backShift } = camera.pack;
  const back = index >= PACK.perRow;
  const left = PACK.right - PACK.perRow * spacing;

  return {
    x: left + (back ? backShift : 0) + (index % PACK.perRow) * spacing,
    y: feet[back ? 1 : 0] - size.height,
    ...size,
  };
}

export function bossSlot(size: Size): Box {
  return { x: ARENA.width - BOSS.margin - size.width, y: BOSS.feet - size.height, ...size };
}
