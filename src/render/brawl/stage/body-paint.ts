import type { DeathKind } from '@content';
import { kitFor } from '../paint/biped-parts';
import { paintBiped } from '../paint/biped';
import { Painter } from '../paint/painter';
import { clamp01 } from '../rig/skeleton';
import type { Body } from './body';

// How each element fells a wiped party: a colour laid over the fallen, and how much of it.
const DEATH: Readonly<Record<DeathKind, readonly [color: string, alpha: number]>> = {
  ash: ['#3a3633', 0.75],
  ice: ['#bfeaff', 0.55],
  stone: ['#8a8f99', 0.7],
  shock: ['#e8f0ff', 0.5],
  melt: ['#7cc35b', 0.5],
  bones: ['#e8e2d0', 0.6],
  drain: ['#7a2a8a', 0.55],
  gold: ['#f2c14e', 0.65],
  sink: ['#0a0a12', 0.75],
  context: ['#2af0ff', 0.4],
  clip: ['#c9ced6', 0.7],
};

// Bodies further back sit in the air's haze: the far band darker than the middle one. One layer
// per band costs a few draws a frame where a filter per body would cost one per body.
const HAZE = [
  { above: 0.62, alpha: 0.28 },
  { above: 0.3, alpha: 0.14 },
] as const;
const HAZE_COLOR = '#140f1c';

function grip(body: Body): { pull: number; charge: number } {
  const u = body.progress;

  return {
    pull: body.move === 'bow' && u > 0.2 && u < 0.6 ? clamp01((u - 0.2) / 0.36) : 0,
    charge: body.move === 'staff' || body.move === 'cast' ? Math.sin(Math.PI * clamp01(u)) : 0,
  };
}

function paintBody(p: Painter, body: Body, t: number): void {
  const kit = kitFor(p, body.palette, t);
  const { look } = body;

  if (look.rig === 'biped') {
    paintBiped(kit, {
      look,
      build: body.build,
      points: body.points,
      facing: body.facing,
      tier: body.tier,
      tint: body.tint,
      disarmed: body.disarmed,
      cloth: body.cloth.length > 0 ? body.cloth : null,
      grip: grip(body),
      mood: body.mood,
      hero: body.hero,
    });

    return;
  }
  const state = body.beastState();

  p.mood = body.mood;
  p.outline = 2 + body.scale * 0.7;
  if (state) body.rig?.paint(kit, state, body.points);
}

function layer(main: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas');

  canvas.width = main.width;
  canvas.height = main.height;

  return canvas.getContext('2d');
}

// Draws the bodies far to near. A blow's flash is the body drawn again in light; a wiped party
// is drawn on its own layer and coloured by how its element fells it.
export class BodyLayers {
  readonly #main: CanvasRenderingContext2D;
  readonly #painter: Painter;
  #bands: (CanvasRenderingContext2D | null)[] = [];
  #wipe: CanvasRenderingContext2D | null = null;

  constructor(main: CanvasRenderingContext2D) {
    this.#main = main;
    this.#painter = new Painter(main);
  }

  resize(): void {
    const canvas = this.#main.canvas;

    this.#bands = HAZE.map(() => layer(canvas));
    this.#wipe = layer(canvas);
  }

  paint(bodies: readonly Body[], t: number, death: DeathKind | null): void {
    const main = this.#main;
    const wipe = death ? this.#wipe : null;
    let i = 0;

    if (wipe) this.#clear(wipe);
    HAZE.forEach((band, index) => {
      const target = this.#bands[index] ?? null;
      const from = i;

      if (target) this.#clear(target);
      while (i < bodies.length && (bodies[i]?.z ?? 0) > band.above) {
        const body = bodies[i];

        i += 1;
        if (body) this.#one(wipe && body.hero ? wipe : (target ?? main), body, t);
      }
      if (target && i > from) this.#compose(target, HAZE_COLOR, band.alpha);
    });
    for (; i < bodies.length; i += 1) {
      const body = bodies[i];

      if (body) this.#one(wipe && body.hero ? wipe : main, body, t);
    }
    if (wipe && death) this.#compose(wipe, ...DEATH[death]);
  }

  #one(ctx: CanvasRenderingContext2D, body: Body, t: number): void {
    const p = this.#painter;

    p.ctx = ctx;
    ctx.save();
    ctx.globalAlpha = body.alpha;
    paintBody(p, body, t);
    if (body.flash > 0.05) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = body.alpha * body.flash * 0.8;
      paintBody(p, body, t);
    }
    ctx.restore();
  }

  #clear(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(this.#main.getTransform());
  }

  // Colours a layer's bodies and lays the layer over the scene.
  #compose(ctx: CanvasRenderingContext2D, color: string, alpha: number): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
    const main = this.#main;

    main.save();
    main.setTransform(1, 0, 0, 1, 0, 0);
    main.drawImage(ctx.canvas, 0, 0);
    main.restore();
  }
}
