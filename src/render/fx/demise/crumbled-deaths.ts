import { heapSlot, type Body, type Cell } from './body';
import type { Demise } from './demise';
import { clamp01, css, ease, ellipse, mix, noise, paintCells, square, squares } from './paint';

const HEAP = 16;
const ASH = { ember: '#ffb02e', char: '#2a2420', grey: '#4a423a', smoke: '#8a8070' } as const;
const VENOM = { body: '#5b8a24', pool: '#3d6018', rim: '#7cc35b', bubble: '#c7d94a' } as const;
const BONE = { skull: '#e9e2cc', bone: '#c9c3b4', eye: '#141418' } as const;
// A small skeleton on the hero's own grid; it stands in for any hero, as a costume does.
const SKELETON = [
  '..hhh...',
  '..hxh...',
  '..hhh...',
  '...h....',
  '..hhh...',
  '...h....',
  '..hhh...',
  '..h.h...',
  '..h.h...',
  '..h.h...',
];

function skeletonOf(): Cell[] {
  return SKELETON.flatMap((row, y) =>
    row
      .split('')
      .flatMap((char, x) =>
        char === '.' ? [] : [{ x, y, color: char === 'x' ? BONE.eye : BONE.skull, index: 0 }],
      ),
  ).map((cell, index) => ({ ...cell, index }));
}

const BONES = skeletonOf();
const SKULL = BONES.filter((cell) => cell.y < 3);
const SPINE = BONES.filter((cell) => cell.y >= 3);

const greyed = (cell: Cell) => cell.index % 5 === 0;

function fallTo(body: Body, cell: Cell, fall: number, curve: number) {
  const from = { x: body.x + cell.x * body.scale, y: body.y + cell.y * body.scale };
  const to = heapSlot(body, cell.index);

  return { x: from.x + (to.x - from.x) * ease(fall), y: from.y + (to.y - from.y) * fall ** curve };
}

export const ash: Demise = {
  dying(context, body, progress) {
    const heat = clamp01(progress / 0.4);
    const char = clamp01((progress - 0.4) / 0.25);

    if (progress < 0.55) {
      paintCells(context, body, body.cells, (cell) =>
        char > 0
          ? mix(ASH.ember, ASH.char, char)
          : mix(cell.color, ASH.ember, heat * 1.6 - ((body.rows - 1 - cell.y) / body.rows) * 0.6),
      );

      return;
    }
    // Charred through by now, so every falling cell is the same colour.
    const falling = body.cells.flatMap((cell) => {
      const fall = clamp01((progress - 0.55 - (cell.y / body.rows) * 0.15) / 0.3);

      return fall >= 1 && cell.index >= HEAP ? [] : [fallTo(body, cell, fall, 2)];
    });

    squares(context, falling, body.scale, css(mix(ASH.ember, ASH.char, char)));
  },
  down(context, body, scene) {
    const heap = body.cells.slice(0, HEAP);

    squares(
      context,
      heap.filter((cell) => !greyed(cell)).map((cell) => heapSlot(body, cell.index)),
      body.scale,
      ASH.char,
    );
    squares(
      context,
      heap.filter(greyed).map((cell) => heapSlot(body, cell.index)),
      body.scale,
      ASH.grey,
    );
    [0, 3].forEach((index, ember) => {
      const at = heapSlot(body, index);

      square(
        context,
        at.x,
        at.y,
        body.scale,
        ASH.ember,
        0.5 + 0.5 * Math.sin(scene.time * 6 + ember * 2),
      );
    });
    for (let puff = 0; puff < 3; puff += 1) {
      const rise = (scene.time * 0.6 + puff / 3) % 1;

      square(
        context,
        body.cx - 1 + Math.sin(rise * 6 + puff) * 3,
        body.feet - 6 - rise * 26,
        2,
        ASH.smoke,
        0.6 * (1 - rise),
      );
    }
  },
};

function puddle(context: CanvasRenderingContext2D, body: Body, grow: number): void {
  if (grow <= 0) return;
  const radius = body.cols * body.scale * 0.75 * ease(grow);

  ellipse(context, body.cx, body.feet - 1, { x: radius + 1, y: 4 }, VENOM.rim);
  ellipse(context, body.cx, body.feet - 1, { x: radius, y: 3 }, VENOM.pool);
}

export const melt: Demise = {
  dying(context, body, progress) {
    puddle(context, body, clamp01((progress - 0.35) / 0.5));
    for (const cell of body.cells) {
      const sag = clamp01(progress * 1.3 - (cell.y / body.rows) * 0.3);
      const top = body.y + cell.y * body.scale;
      const x = body.x + cell.x * body.scale + (cell.x - body.cols / 2) * body.scale * 0.7 * sag;
      const y = top + (body.feet - body.scale - top) * sag * sag;

      square(
        context,
        x,
        y,
        body.scale,
        css(mix(cell.color, VENOM.body, progress * 2)),
        1 - clamp01((progress - 0.75) / 0.25),
      );
    }
  },
  down(context, body, scene) {
    puddle(context, body, 1);
    for (let bubble = 0; bubble < 3; bubble += 1) {
      const rise = (scene.time * 0.8 + bubble / 3 + noise(body.seed)) % 1;

      square(
        context,
        body.cx - 8 + bubble * 7,
        body.feet - 2 - rise * 6,
        2,
        VENOM.bubble,
        1 - rise,
      );
    }
  },
};

function heapOfBones(context: CanvasRenderingContext2D, body: Body, fall: number): void {
  const at = (cell: Cell) => fallTo(body, cell, fall, 1);

  squares(context, SKULL.map(at), body.scale, BONE.skull);
  squares(context, SPINE.map(at), body.scale, BONE.bone);
}

export const bones: Demise = {
  dying(context, body, progress) {
    paintCells(context, body, body.cells, (cell) => cell.color, { alpha: 1 - progress / 0.45 });
    if (progress < 0.6) {
      paintCells(context, body, BONES, (cell) => cell.color, {
        alpha: progress / 0.3,
        outline: false,
      });

      return;
    }
    heapOfBones(context, body, ease(clamp01((progress - 0.6) / 0.4)));
  },
  down(context, body) {
    heapOfBones(context, body, 1);
  },
};
