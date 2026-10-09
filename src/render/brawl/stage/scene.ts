import type { Content } from '@content';
import type { Roster } from '@engine';
import type { Body } from './body';
import { BodyLayers } from './body-paint';
import { trail } from './bursts';
import { ambient } from './debris';
import { Camera } from './camera';
import { Choreography } from './choreography';
import { Director } from './director';
import { FIELD } from './field';
import { paintDecals, paintFx, paintTexts } from './fx-paint';
import { paintBars, paintSelection, paintShadows, paintStates } from './overlays';
import { Collisions } from './steering';
import { hand, top, World } from './world';

// The world steps at a fixed rate; a slow frame runs at most this many steps and drops the rest.
const MAX_STEPS = 10;
const order = (body: Body): number => -body.z * 100 + (body.dead ? 0 : body.ragdoll ? 1 : 2);

// The fight on the floor: it steps the world at a fixed rate and paints it far to near.
export class Scene {
  readonly world: World;
  readonly camera = new Camera();
  readonly director: Director;
  readonly choreography: Choreography;
  readonly #collisions = new Collisions();
  readonly #layers: BodyLayers;
  #debt = 0;

  constructor(context: CanvasRenderingContext2D, content: Content, roster: Roster) {
    this.world = new World(content, roster);
    this.director = new Director(this.world);
    this.choreography = new Choreography(this.world);
    this.#layers = new BodyLayers(context);
  }

  resize(): void {
    this.#layers.resize();
  }

  // Real seconds in; slow motion and hit-stop decide how much of them the world lives through.
  advance(real: number): number {
    const { world } = this;
    const lived = real * world.juice.rate();
    let steps = 0;

    world.juice.step(real);
    this.#debt += lived;
    while (this.#debt >= FIELD.step && steps < MAX_STEPS) {
      this.#tick(FIELD.step);
      this.#debt -= FIELD.step;
      steps += 1;
    }
    if (steps >= MAX_STEPS) this.#debt = 0;
    world.fx.step(lived, FIELD.ground);
    ambient(world.fx, world.frame.left, FIELD.width, FIELD.ground, lived, world.accent);
    this.#smoulder();
    if (world.wipe) world.wipe.t += real;
    this.camera.follow(world.frame, this.#selected());

    return lived;
  }

  #tick(dt: number): void {
    const { world } = this;
    const grab = world.grab;

    world.frame.time += dt;
    world.later.step(dt);
    this.choreography.step(dt);
    for (const body of world.cast.all) {
      const pin =
        grab?.body === body
          ? { index: grab.index, x: grab.x, y: grab.y, vx: grab.vx, vy: grab.vy }
          : null;

      body.step(dt, world.frame, pin);
    }
    this.#collisions.step(world);
    world.shots.step(dt, world.fx);
    world.vfx.step(dt, world.fx);
    world.props.step(dt, world.frame.left);
    this.director.step();
  }

  // Burning foes smoke from a joint picked at random each frame.
  #smoulder(): void {
    const { world } = this;

    world.battle?.foes.forEach((foe, index) => {
      const body = world.cast.foe(index);

      if (!body || foe.hp <= 0 || !foe.burn || foe.burn.left <= 0 || Math.random() > 0.5) return;
      const point = body.points[Math.floor(Math.random() * body.points.length)];

      if (point) trail(world.fx, point.x, point.y, false, '#ff7a2b');
    });
  }

  #selected() {
    const id = this.world.selected;
    const body = id ? this.world.cast.hero(id) : undefined;

    return body ? { x: body.center.x, y: body.ground } : null;
  }

  paint(ctx: CanvasRenderingContext2D): void {
    const { world } = this;
    const view = this.camera.world;
    const bodies = world.cast.all
      .filter((body) => body.alpha > 0)
      .toSorted((a, b) => order(a) - order(b));

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale, view.scale);
    world.juice.applyPunch(ctx);
    paintDecals(ctx, world.fx);
    paintShadows(ctx, bodies);
    paintSelection(ctx, world, true);
    this.#layers.paint(bodies, world.frame.time, world.wipe?.death ?? null);
    world.props.paint(ctx, world.frame.time);
    world.vfx.paint(ctx, hand, top);
    world.shots.paint(ctx);
    paintFx(ctx, world.fx);
    paintStates(ctx, world);
    paintBars(ctx, world);
    paintSelection(ctx, world, false);
    paintTexts(ctx, world.fx);
    ctx.restore();
  }
}
