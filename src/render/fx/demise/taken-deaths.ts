import type { Body, Cell } from './body';
import type { Demise } from './demise';
import { clamp01, ease, mix, paintCells, ramp, squares } from './paint';

const OUTLINE = '#c9bcff';
const STEEL = ['#5a626c', '#b8c0c8', '#f0f4f8'] as const;
const PAPERCLIP = ['.ccc.', 'c...c', 'c.c.c', 'c.c.c', 'c.c.c', 'c.c..', 'c.c..', '..c..'];
const CLIP_CELLS: Cell[] = PAPERCLIP.flatMap((row, y) =>
  row
    .split('')
    .flatMap((char, x) =>
      char === 'c' ? [{ x, y, color: y < 2 ? STEEL[2] : STEEL[1], index: 0 }] : [],
    ),
);

// What is left when the context is gone: a dotted outline where the hero stood.
function outline(context: CanvasRenderingContext2D, body: Body, alpha: number): void {
  if (alpha <= 0) return;
  const dots = body.edge
    .filter((cell) => (cell.x + cell.y) % 2 === 0)
    .map((cell) => ({ x: body.x + cell.x * body.scale, y: body.y + cell.y * body.scale }));

  squares(context, dots, Math.max(1, body.scale - 1), OUTLINE, alpha);
}

export const context: Demise = {
  dying(canvas, body, progress, scene) {
    const flightOf = (row: number) =>
      clamp01((progress - ((body.rows - 1 - row) / body.rows) * 0.4) / 0.5);

    outline(canvas, body, (progress - 0.4) / 0.6);
    paintCells(canvas, body, body.cells, (cell) => (flightOf(cell.y) <= 0 ? cell.color : null));
    for (let row = 0; row < body.rows; row += 1) {
      const cells = body.cells.filter((cell) => cell.y === row);
      const flight = flightOf(row);

      if (cells.length === 0 || flight <= 0 || flight >= 1) continue;
      const fromX = body.x + Math.min(...cells.map((cell) => cell.x)) * body.scale;
      const fromY = body.y + row * body.scale;
      const x = fromX + (scene.target.x - fromX) * ease(flight);
      const y = fromY + (scene.target.y - fromY) * flight - Math.sin(flight * Math.PI) * 30;

      canvas.fillStyle = scene.accent;
      canvas.fillRect(x, y, cells.length * body.scale * 0.7, body.scale);
    }
  },
  down(canvas, body) {
    outline(canvas, body, 1);
  },
};

function paperclip(canvas: CanvasRenderingContext2D, body: Body, alpha: number): void {
  const scale = Math.max(1, body.scale - 1);

  canvas.save();
  canvas.translate(body.cx, body.feet - 4);
  canvas.rotate(Math.PI / 2);
  canvas.translate(-body.cx, -(body.feet - 4));
  paintCells(canvas, body, CLIP_CELLS, (cell) => cell.color, {
    alpha,
    scale,
    at: { x: body.cx - scale * 2.5, y: body.feet - 4 - scale * 4 },
  });
  canvas.restore();
}

export const clip: Demise = {
  dying(canvas, body, progress) {
    if (progress < 0.8) {
      const shrink = 1 - 0.75 * ease(clamp01((progress - 0.3) / 0.5));

      canvas.save();
      canvas.translate(body.cx, body.feet);
      canvas.scale(shrink, shrink);
      canvas.translate(-body.cx, -body.feet);
      paintCells(canvas, body, body.cells, (cell) =>
        mix(cell.color, ramp(STEEL, cell.color), progress / 0.3),
      );
      canvas.restore();
    }
    if (progress >= 0.7) paperclip(canvas, body, (progress - 0.7) / 0.3);
  },
  down(canvas, body) {
    paperclip(canvas, body, 1);
  },
};
