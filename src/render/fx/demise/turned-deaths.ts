import type { Body, Cell } from './body';
import type { Demise } from './demise';
import { clamp01, ease, mix, noise, paintCells, ramp, square } from './paint';

const STONE = ['#6a655a', '#a8a294', '#e0dacb'] as const;
const CRACK = '#2f2a24';
const GOLD = ['#8a5a14', '#e8a23a', '#fff3c4'] as const;
const FROST = '#bfeaff';
const ICE = { fill: 'rgba(159, 216, 255, 0.42)', rim: '#e8f7ff', shine: '#ffffff' } as const;

// How far a sweep rising from the feet has reached a cell, from 0 to 1.
const risen = (body: Body, cell: Cell, sweep: number, sharpness: number) =>
  clamp01((sweep - (body.rows - 1 - cell.y) / body.rows) * sharpness);

const cracked = (body: Body, cell: Cell) => noise(body.seed + cell.index * 31) < 0.12;

export const stone: Demise = {
  dying(context, body, progress) {
    paintCells(context, body, body.cells, (cell) =>
      progress > 0.7 && cracked(body, cell)
        ? CRACK
        : mix(cell.color, ramp(STONE, cell.color), risen(body, cell, progress * 1.4, 3)),
    );
  },
  down(context, body, scene) {
    this.dying(context, body, 1, scene);
  },
};

function glint(context: CanvasRenderingContext2D, body: Body, share: number): void {
  const width = body.cols * body.scale;
  const height = body.rows * body.scale;
  const x = body.x - 10 + share * (width + 20);

  context.save();
  context.beginPath();
  context.rect(body.x, body.y, width, height);
  context.clip();
  context.globalAlpha = 0.8;
  context.fillStyle = ICE.shine;
  context.beginPath();
  for (let step = -height; step < height; step += 2) {
    context.rect(x + step * 0.5, body.y + height - step, 3, 2);
  }
  context.fill();
  context.restore();
}

export const gold: Demise = {
  dying(context, body, progress) {
    paintCells(context, body, body.cells, (cell) =>
      mix(cell.color, ramp(GOLD, cell.color), risen(body, cell, progress * 1.3, 4)),
    );
    if (progress > 0.8) glint(context, body, (progress - 0.8) / 0.2);
  },
  down(context, body, scene) {
    paintCells(context, body, body.cells, (cell) => ramp(GOLD, cell.color));
    const shine = (scene.time * 0.5 + noise(body.seed)) % 1;

    if (shine < 0.3) glint(context, body, shine / 0.3);
  },
};

function block(context: CanvasRenderingContext2D, body: Body, grow: number): void {
  if (grow <= 0) return;
  const pad = body.scale + 1;
  const x = body.x - pad;
  const width = body.cols * body.scale + pad * 2;
  const top = body.feet - (body.rows * body.scale + pad * 2) * ease(grow);

  context.fillStyle = ICE.fill;
  context.fillRect(x, top, width, body.feet - top);
  context.strokeStyle = ICE.rim;
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, top + 0.5, width - 1, body.feet - top - 1);
  for (let step = 0; step < 4; step += 1)
    square(context, x + 3 + step, top + 3 + step * 2, 1, ICE.shine);
}

export const ice: Demise = {
  dying(context, body, progress) {
    const tint = clamp01(progress / 0.4);

    paintCells(context, body, body.cells, (cell) =>
      mix(cell.color, FROST, risen(body, cell, tint * 1.5, 2) * 0.6),
    );
    block(context, body, clamp01((progress - 0.3) / 0.6));
  },
  down(context, body) {
    paintCells(context, body, body.cells, (cell) => mix(cell.color, FROST, 0.6));
    block(context, body, 1);
  },
};
