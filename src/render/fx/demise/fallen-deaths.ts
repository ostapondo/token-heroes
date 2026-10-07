import type { Body, Cell } from './body';
import type { Demise } from './demise';
import { clamp01, css, ease, ellipse, mix, noise, paintCells, ramp, square, tipped } from './paint';

const CHARRED = ['#141418', '#3a3a40'] as const;
const HUSK = ['#4a3a38', '#9a8a80'] as const;
const SHOCK = {
  flash: '#ffffff',
  dark: '#1a1a22',
  bone: '#e9eef5',
  spark: '#ffe94a',
  smoke: '#6a7080',
} as const;
const SHADOW = { pool: '#000000', eye: '#f2f2f2' } as const;
const DRIPS = 5;
// The bones a lightning flash shows through the hero, cartoon style, on the hero's own grid.
const XRAY = [
  '..xxx...',
  '..x.x...',
  '..xxx...',
  '...x....',
  '.xxxxx..',
  '...x....',
  '..xxx...',
  '..x.x...',
  '..x.x...',
  '..x.x...',
];
const XRAY_CELLS: Cell[] = XRAY.flatMap((row, y) =>
  row.split('').flatMap((char, x) => (char === 'x' ? [{ x, y, color: SHOCK.bone, index: 0 }] : [])),
);

const feetOf = (body: Body) => ({ x: body.cx, y: body.feet });

function charred(context: CanvasRenderingContext2D, body: Body, tip: number): void {
  tipped(context, feetOf(body), tip, () =>
    paintCells(context, body, body.cells, (cell) => css(ramp(CHARRED, cell.color))),
  );
}

export const shock: Demise = {
  dying(context, body, progress) {
    if (progress < 0.45) {
      const lit = Math.floor(progress / 0.075) % 2 === 0;

      paintCells(context, body, body.cells, () => (lit ? SHOCK.flash : SHOCK.dark));
      if (!lit) paintCells(context, body, XRAY_CELLS, (cell) => cell.color, { outline: false });

      return;
    }
    charred(context, body, ease(clamp01((progress - 0.45) / 0.35)));
  },
  down(context, body, scene) {
    charred(context, body, 1);
    const flicker = (scene.time * 3 + body.seed) % 1;

    if (flicker < 0.25) {
      square(
        context,
        body.cx - 10 + noise(Math.floor(scene.time * 3) + body.seed) * 20,
        body.feet - 8,
        2,
        SHOCK.spark,
      );
    }
    const rise = (scene.time * 0.5 + noise(body.seed)) % 1;

    square(context, body.cx + 4, body.feet - 10 - rise * 20, 2, SHOCK.smoke, 0.6 * (1 - rise));
  },
};

function husk(context: CanvasRenderingContext2D, body: Body, progress: number): void {
  const dry = clamp01(progress / 0.6);

  tipped(
    context,
    feetOf(body),
    ease(clamp01((progress - 0.6) / 0.35)),
    () =>
      paintCells(context, body, body.cells, (cell) =>
        css(mix(cell.color, ramp(HUSK, cell.color), dry)),
      ),
    1 - 0.35 * dry,
  );
}

export const drain: Demise = {
  dying(context, body, progress, scene) {
    husk(context, body, progress);
    for (let drip = 0; drip < DRIPS; drip += 1) {
      const flow = clamp01(progress * 1.6 - drip * 0.12);

      if (flow <= 0 || flow >= 1) continue;
      const fromY = body.y + body.scale * 3;
      const x = body.cx + (scene.target.x - body.cx) * flow;
      const y = fromY + (scene.target.y - fromY) * flow - Math.sin(flow * Math.PI) * 20;

      square(context, x, y, 3, scene.accent);
    }
  },
  down(context, body, scene) {
    ellipse(
      context,
      body.cx - 6,
      body.feet - 1,
      { x: 9, y: 2 },
      css(mix(scene.accent, '#000000', 0.6)),
    );
    husk(context, body, 1);
  },
};

function pool(context: CanvasRenderingContext2D, body: Body, grow: number): void {
  ellipse(
    context,
    body.cx,
    body.feet - 1,
    { x: body.cols * body.scale * 0.7 * ease(grow), y: 3 },
    SHADOW.pool,
  );
}

export const sink: Demise = {
  dying(context, body, progress) {
    pool(context, body, clamp01(progress / 0.3));
    const depth = ease(clamp01((progress - 0.25) / 0.75)) * (body.rows * body.scale + 2);

    context.save();
    context.beginPath();
    context.rect(0, 0, context.canvas.width, body.feet - 1);
    context.clip();
    paintCells(context, body, body.cells, (cell) => cell.color, { dy: depth });
    context.restore();
  },
  down(context, body, scene) {
    pool(context, body, 1);
    const open = (scene.time + noise(body.seed) * 3) % 3 > 0.2;

    if (!open) return;
    square(context, body.cx - 4, body.feet - 2, 2, SHADOW.eye);
    square(context, body.cx + 2, body.feet - 2, 2, SHADOW.eye);
  },
};
