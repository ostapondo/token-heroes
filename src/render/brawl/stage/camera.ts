import type { Point } from '../../geometry';
import { smooth } from '../rig/skeleton';
import { FIELD, type Frame } from './field';

// A lone hero is seen at 130%; every hero who joins pulls the camera back a little, so fourteen
// share the window at about 85%.
const ZOOM = { alone: 1.3, perHero: 0.035, widest: 0.84 } as const;
// Watching a hero, the camera leans in this much on it and holds its feet at this height.
const FOCUS = { zoom: 1.45, floor: 290, ease: 0.12 } as const;

interface View {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export class Camera {
  #focus = 0;
  #at: Point | null = null;
  // The world's transform to the screen, and the backdrop's, which follows the camera in but never
  // pulls back past its own edges.
  world: View = { x: 0, y: 0, scale: 1 };
  backdrop: View = { x: 0, y: 0, scale: 1 };

  frame(frame: Frame, party: number): void {
    frame.zoom = Math.max(ZOOM.widest, ZOOM.alone - ZOOM.perHero * Math.max(0, party - 1));
    frame.left = FIELD.width - FIELD.width / frame.zoom;
  }

  follow(frame: Frame, target: Point | null): void {
    const zoom = frame.zoom;

    this.#focus += ((target ? 1 : 0) - this.#focus) * FOCUS.ease;
    if (target) this.#at = target;
    const bx = FIELD.width * (1 - zoom);
    const by = FIELD.ground * (1 - zoom);
    const f = this.#at ? smooth(Math.min(1, this.#focus)) : 0;
    const at = this.#at ?? { x: 0, y: 0 };
    const near = Math.max(zoom, FOCUS.zoom);
    const scale = zoom + (near - zoom) * f;
    const x = bx + (FIELD.width / 2 - near * at.x - bx) * f;
    const y = by + (FOCUS.floor - near * at.y - by) * f;
    const held = Math.min(1, zoom);

    this.world = { x, y, scale };
    this.backdrop = {
      x: x + scale * FIELD.width * (1 - 1 / held),
      y: y + scale * FIELD.ground * (1 - 1 / held),
      scale: scale / held,
    };
  }

  toWorld(screen: Point): Point {
    const { x, y, scale } = this.world;

    return { x: (screen.x - x) / scale, y: (screen.y - y) / scale };
  }
}
