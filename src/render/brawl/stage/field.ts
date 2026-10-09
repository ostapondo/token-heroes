// The arena floor in world units: 400 wide, the pixel backdrop's 186 scaled up. Depth z runs from 0
// (near) to 1 (far); the far ground sits higher and draws everything 30% smaller.
export const FIELD = {
  width: 400,
  height: 366,
  ground: 319,
  depth: 66,
  // The pixel backdrop is this many times smaller than the world.
  pixel: 186 / 400,
  step: 1 / 120,
} as const;

export interface Frame {
  // The world's left edge as the camera pulls back for a bigger party.
  left: number;
  zoom: number;
  time: number;
}

export const groundAt = (z: number): number => FIELD.ground - FIELD.depth * z;
export const depthScale = (z: number): number => 1 - 0.3 * z;
// Models are drawn 1.3 times their design size so a limb reads in a 400 px window.
export const MODEL_SCALE = 1.3;
