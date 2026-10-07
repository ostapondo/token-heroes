import type { Actor } from '../../scene/cast';
import { pixelColors } from '../../sprites/pixels';

export interface Cell {
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly index: number;
}

// A hero as single pixels, so a death can move, recolour or drop each one on its own.
export interface Body {
  readonly cells: readonly Cell[];
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly rows: number;
  readonly cols: number;
  readonly cx: number;
  readonly feet: number;
  readonly seed: number;
  readonly edge: readonly { readonly x: number; readonly y: number }[];
}

const bodies = new Map<string, Body>();

function seedOf(id: string): number {
  return id.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function edgeOf(cells: readonly Cell[], cols: number, rows: number): Body['edge'] {
  const solid = new Set(cells.map((cell) => `${cell.x},${cell.y}`));
  const edge: { x: number; y: number }[] = [];
  const sides = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  for (let y = -1; y <= rows; y += 1) {
    for (let x = -1; x <= cols; x += 1) {
      const touches = sides.some(([dx, dy]) => solid.has(`${x + dx},${y + dy}`));

      if (!solid.has(`${x},${y}`) && touches) edge.push({ x, y });
    }
  }

  return edge;
}

export function bodyOf(actor: Actor): Body {
  const { box, pixel } = actor;
  const key = `${actor.key}:${box.x}:${box.y}:${pixel}`;
  const known = bodies.get(key);

  if (known) return known;
  const cells = pixelColors(actor.sprite, actor.palette).flatMap((row, y) =>
    row.flatMap((color, x) => (color ? [{ x, y, color }] : [])),
  );
  const indexed = cells.map((cell, index) => ({ ...cell, index }));
  const rows = actor.sprite.rows.length;
  const cols = actor.sprite.rows[0]?.length ?? 0;
  const body: Body = {
    cells: indexed,
    x: box.x,
    y: box.y,
    scale: pixel,
    rows,
    cols,
    cx: box.x + box.width / 2,
    feet: box.y + box.height,
    seed: seedOf(actor.id),
    edge: edgeOf(indexed, cols, rows),
  };

  bodies.set(key, body);

  return body;
}

// Where the n-th grain of a body lands in a heap at its feet.
export function heapSlot(body: Body, index: number): { x: number; y: number } {
  const layer = Math.floor(Math.sqrt(index));
  const slot = index - layer * layer;

  return {
    x: body.cx + (slot - layer) * body.scale * 0.9 - body.scale / 2,
    y: body.feet - body.scale - layer * body.scale * 0.8,
  };
}
