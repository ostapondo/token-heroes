import { ARENA, type Point } from '../scene/geometry';

// Hits from a whole party land in the same frame; each number steps aside and up from the
// last so a burst reads as a zigzag instead of one smudge.
const ZIGZAG = { sideways: 14, upward: 8, turns: 4, margin: 12 } as const;

export class NumberTrail {
  #turn = 0;

  place(at: Point): Point {
    const turn = this.#turn;
    const side = turn % 2 === 0 ? -1 : 1;
    const x = at.x + side * ZIGZAG.sideways;

    this.#turn = (turn + 1) % ZIGZAG.turns;

    return {
      x: Math.min(Math.max(x, ZIGZAG.margin), ARENA.width - ZIGZAG.margin),
      y: at.y - turn * ZIGZAG.upward,
    };
  }
}
