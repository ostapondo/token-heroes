// The horizon sits on the lower third: a full party's back rank stands 22 px in front of it.
export const ARENA = { width: 186, height: 170, floorHeight: 58 } as const;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Box extends Point {
  readonly width: number;
  readonly height: number;
}

export const floorTop = (): number => ARENA.height - ARENA.floorHeight;

export const center = (box: Box): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});
