export const ARENA = { width: 186, height: 170, floorHeight: 40 } as const;

export const SPRITE_SCALE = { hero: 3, enemy: 3, boss: 4 } as const;

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
