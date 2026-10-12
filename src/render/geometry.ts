// The pixel backdrop's own units: the horizon sits on the lower third.
export const ARENA = { width: 186, height: 170, floorHeight: 58 } as const;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export const floorTop = (): number => ARENA.height - ARENA.floorHeight;
