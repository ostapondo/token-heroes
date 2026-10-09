import { elementById, type Content, type ElementDef } from '@content';
import {
  upcomingBoss,
  type BattleEvent,
  type BattleState,
  type PartyState,
  type Roster,
} from '@engine';
import { Backdrop } from '../backdrop/backdrop';
import { runLoop } from '../loop';
import { Guarded } from '../guarded';
import { createWeather, WeatherLayer, type Weather } from '../weather';
import { FIELD } from './stage/field';
import { Pointer } from './stage/pointer';
import { Scene } from './stage/scene';
import { shed } from './stage/debris';
import { top } from './stage/world';

export interface ArenaOptions {
  readonly canvas: HTMLCanvasElement;
  readonly content: Content;
  readonly roster: Roster;
  readonly onError: (error: unknown, where: string) => void;
  // A tap on a foe strikes it.
  readonly onStrike?: (foe: number) => void;
}

// The pixel backdrop's weather centres on the foes' ground, a little above their feet.
const FOCUS = { x: 140, y: 152 } as const;

export class Arena {
  readonly #options: ArenaOptions;
  readonly #context: CanvasRenderingContext2D;
  readonly #scene: Scene;
  readonly #pointer: Pointer;
  readonly #guard: Guarded;
  readonly #backdrop = new Backdrop();
  #weather: Weather[] = [];
  #scale = 1;
  #stop: (() => void) | undefined;

  constructor(options: ArenaOptions) {
    const context = options.canvas.getContext('2d');

    if (!context) throw new Error('Canvas 2D is unavailable');
    this.#options = options;
    this.#context = context;
    this.#guard = new Guarded(options.onError);
    this.#scene = new Scene(context, options.content, options.roster);
    this.#pointer = new Pointer(options.canvas, this.#scene, (foe) => options.onStrike?.(foe));
  }

  show(battle: BattleState, party: PartyState): void {
    const { world, camera, choreography } = this.#scene;
    const element = elementById(
      this.#options.content,
      upcomingBoss(this.#options.roster, battle.stage).element,
    );

    if (world.element?.id !== element.id) this.#setElement(element);
    world.previous = world.battle;
    world.battle = battle;
    world.party = party;
    camera.frame(world.frame, party.heroes.length);
    const tiers = new Map([...world.cast.heroes].map(([id, body]) => [id, body.tier]));

    world.cast.syncHeroes(party, element.palette, world.frame);
    world.cast.syncFoes(battle, element, world.frame);
    // Starting over strips a hero of the gear its levels earned.
    for (const [id, body] of world.cast.heroes) {
      const before = tiers.get(id) ?? 0;

      if (body.tier < before)
        shed(world.fx, top(body).x, top(body).y, body.tint ?? '#ffffff', 3 + before * 2);
    }
    choreography.shown();
  }

  play(events: readonly BattleEvent[]): void {
    this.#guard.survives('battle events', () => this.#scene.director.play(events));
  }

  celebrate(heroId: string, level: number): void {
    this.#guard.survives('celebration', () => this.#scene.director.celebrate(heroId, level));
  }

  // The camera leans in on this hero while its sheet is open.
  select(heroId: string | null): void {
    this.#scene.world.selected = heroId;
  }

  resize(cssWidth: number, pixelRatio: number): void {
    const { canvas } = this.#options;

    this.#scale = (cssWidth / FIELD.width) * pixelRatio;
    canvas.width = Math.round(FIELD.width * this.#scale);
    canvas.height = Math.round(FIELD.height * this.#scale);
    this.#context.imageSmoothingEnabled = false;
    this.#scene.resize();
  }

  start(): void {
    this.#pointer.attach();
    this.#stop ??= runLoop((dt) => this.#guard.survives('frame', () => this.#frame(dt)));
  }

  stop(): void {
    this.#pointer.detach();
    this.#stop?.();
    this.#stop = undefined;
  }

  #setElement(element: ElementDef): void {
    this.#scene.world.element = element;
    this.#weather = element.weather.flatMap((def) =>
      this.#guard.attempt('weather setup', () => [createWeather(def)], []),
    );
  }

  #frame(dt: number): void {
    const element = this.#scene.world.element;

    if (!element) return;
    const scene = this.#scene;
    const lived = scene.advance(dt);
    const ctx = this.#context;
    const { juice, fx, freeze } = scene.world;

    this.#weather = this.#weather.filter((effect) =>
      this.#guard.survives('weather', () => effect.update?.(lived)),
    );
    ctx.setTransform(this.#scale, 0, 0, this.#scale, 0, 0);
    ctx.fillStyle = element.palette.x;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.translate(juice.jitter(), juice.jitter());
    this.#pixels(() => {
      this.#backdrop.paint(ctx, element, scene.world.frame.time);
      this.#drawWeather(WeatherLayer.Back);
    });
    scene.paint(ctx);
    this.#pixels(() => this.#drawWeather(WeatherLayer.Front));
    ctx.setTransform(this.#scale, 0, 0, this.#scale, 0, 0);
    if (fx.flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,170,90,${fx.flash * 0.2})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (freeze > 0) {
      ctx.fillStyle = `rgba(255,60,50,${0.12 + 0.06 * Math.sin(scene.world.frame.time * 20)})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    }
  }

  // Runs a draw in the pixel backdrop's own units, under the camera's backdrop transform.
  #pixels(draw: () => void): void {
    const ctx = this.#context;
    const view = this.#scene.camera.backdrop;

    ctx.save();
    ctx.translate(view.x, view.y);
    ctx.scale(view.scale / FIELD.pixel, view.scale / FIELD.pixel);
    draw();
    ctx.restore();
  }

  #drawWeather(layer: Weather['layer']): void {
    this.#weather = this.#weather.filter(
      (effect) =>
        effect.layer !== layer ||
        this.#guard.survives('weather', () => effect.draw(this.#context, { focus: FOCUS })),
    );
  }
}
