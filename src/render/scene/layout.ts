import { ARENA, type Box } from './geometry';

const ROW = { frontFeet: ARENA.height - 10, backFeet: ARENA.height - 22, backShift: 8 } as const;
const PACK = { right: ARENA.width - 4, spacing: 32, perRow: 3 } as const;
const BOSS_MARGIN = 10;

interface Size {
  readonly width: number;
  readonly height: number;
}

function inRows(index: number, perRow: number, backShift: number = ROW.backShift) {
  const back = index >= perRow;

  return {
    column: index % perRow,
    feet: back ? ROW.backFeet : ROW.frontFeet,
    shift: back ? backShift : 0,
  };
}

export function packSlot(index: number, size: Size): Box {
  const { column, feet, shift } = inRows(index, PACK.perRow);
  const left = PACK.right - PACK.perRow * PACK.spacing;

  return { x: left + shift + column * PACK.spacing, y: feet - size.height, ...size };
}

export function bossSlot(size: Size): Box {
  return { x: ARENA.width - BOSS_MARGIN - size.width, y: ROW.frontFeet - size.height, ...size };
}
