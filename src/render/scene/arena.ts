import { elementById, type Content, type ElementDef } from '@content';
import {
  upcomingBoss,
  type BattleEvent,
  type BattleState,
  type PartyState,
  type Roster,
} from '@engine';
import { Backdrop } from '../backdrop/backdrop';
import { Director } from '../fx/director';
import { Telegraphs } from '../fx/telegraphs';
import type { Reaction } from '../fx/reaction';
import { runLoop } from '../loop';
import { SpriteCache } from '../sprites/sprite-cache';
import { createWeather, WeatherLayer, type Weather } from '../weather';
import { PULLBACK } from './camera';
import { Cast, type Pullback } from './cast';
import { EffectLayer } from './effect-layer';
import { Guarded } from './guarded';
import { ARENA, center } from './geometry';
import { Juice } from './juice';
import { paintCast, paintPullback } from './painter';
import { paintSkillStates } from './skill-states';

export interface ArenaOptions {
  readonly canvas: HTMLCanvasElement;
  readonly content: Content;
  readonly roster: Roster;
  readonly onError: (error: unknown, where: string) => void;
}

// Weather that marks the foes' ground, such as the summoning ring, centres just above their feet.
const FOCUS_RISE = 18;

export class Arena {
  readonly #options: ArenaOptions;
  readonly #context: CanvasRenderingContext2D;
  readonly #cast: Cast;
  readonly #director: Director;
  readonly #backdrop = new Backdrop();
  #element: ElementDef | undefined;
  #weather: Weather[] = [];
  readonly #guard: Guarded;
  readonly #effects: EffectLayer;
  readonly #ground: EffectLayer;
  readonly #juice = new Juice();
  readonly #telegraphs: Telegraphs;
  #snapshot: { battle: BattleState; party: PartyState } | undefined;
  #pullback: { scene: Pullback; left: number } | undefined;
  #clock = 0;
  #stop: (() => void) | undefined;

  constructor(options: ArenaOptions) {
    const context = options.canvas.getContext('2d');

    if (!context) throw new Error('Canvas 2D is unavailable');
    this.#options = options;
    this.#context = context;
    this.#cast = new Cast(options.content, new SpriteCache());
    this.#director = new Director(options.content, options.roster);
    this.#telegraphs = new Telegraphs(options.content, options.roster);
    this.#guard = new Guarded(options.onError);
    this.#effects = new EffectLayer('effect', this.#guard);
    this.#ground = new EffectLayer('ground', this.#guard);
  }

  show(battle: BattleState, party: PartyState): void {
    const elementId = upcomingBoss(this.#options.roster, battle.stage).element;

    if (this.#element?.id !== elementId) {
      this.#element = elementById(this.#options.content, elementId);
      this.#weather = this.#element.weather.flatMap((def) =>
        this.#guard.attempt('weather setup', () => [createWeather(def)], []),
      );
    }
    this.#cast.sync(battle, party, this.#element);
    const pullback = this.#cast.takePullback();

    if (pullback) this.#pullback = { scene: pullback, left: PULLBACK.seconds };
    this.#snapshot = { battle, party };
  }

  play(events: readonly BattleEvent[]): void {
    const element = this.#element;

    if (!element) return;
    const stage = { heroes: this.#cast.heroes, foes: this.#cast.foes, element };

    for (const event of events) {
      this.#apply(
        this.#guard.attempt('battle event', () => this.#director.react(event, stage), null),
      );
    }
  }

  celebrate(heroId: string, level: number): void {
    const hero = this.#cast.hero(heroId);

    if (hero) this.#apply(this.#director.celebrate(hero, level));
  }

  resize(cssWidth: number, pixelRatio: number): void {
    const scale = (cssWidth / ARENA.width) * pixelRatio;
    const { canvas } = this.#options;

    canvas.width = Math.round(ARENA.width * scale);
    canvas.height = Math.round(ARENA.height * scale);
    this.#context.setTransform(scale, 0, 0, scale, 0, 0);
    this.#context.imageSmoothingEnabled = false;
  }

  start(): void {
    this.#stop ??= runLoop((dt) => this.#guard.attempt('frame', () => this.#frame(dt), undefined));
  }

  stop(): void {
    this.#stop?.();
    this.#stop = undefined;
  }

  #frame(dt: number): void {
    const element = this.#element;
    const snapshot = this.#snapshot;

    if (!element || !snapshot) return;
    const context = this.#context;
    const actors = [...this.#cast.heroes, ...this.#cast.foes];
    const front = this.#cast.foes[0];
    const focus = {
      x: front ? center(front.box).x : ARENA.width * 0.75,
      y: ARENA.height - FOCUS_RISE,
    };

    const world = this.#juice.advance(dt);

    this.#clock += world;
    for (const actor of actors) actor.motion.update(world);
    this.#weather = this.#weather.filter((effect) =>
      this.#guard.survives('weather', () => effect.update?.(world)),
    );
    this.#effects.update(world);
    this.#ground.update(world);
    if (!this.#pullback) {
      const { battle, party } = snapshot;

      this.#effects.push(
        this.#guard.attempt(
          'telegraph',
          () => this.#telegraphs.update(battle, party, this.#cast),
          [],
        ),
      );
    }
    if (this.#pullback) this.#pullback.left -= dt;
    if (this.#pullback && this.#pullback.left <= 0) this.#pullback = undefined;

    const death = { kind: element.death, accent: element.accent, time: this.#clock };

    context.save();
    const jitter = () => Math.round((Math.random() - 0.5) * this.#juice.shake);

    context.translate(jitter(), jitter());
    this.#backdrop.paint(context, element, this.#clock);
    this.#drawWeather(WeatherLayer.Back, { focus });
    this.#ground.draw(context);
    if (this.#pullback) {
      const progress = 1 - this.#pullback.left / PULLBACK.seconds;

      paintPullback(
        context,
        this.#cast.sprites,
        this.#pullback.scene,
        progress,
        snapshot.battle,
        death,
      );
    } else {
      paintCast(context, this.#cast.sprites, this.#cast, snapshot.battle, death);
      this.#guard.survives('skill states', () =>
        paintSkillStates(context, this.#cast, snapshot, this.#options.content, this.#clock),
      );
    }
    this.#drawWeather(WeatherLayer.Front, { focus });
    this.#effects.draw(context);
    context.restore();
  }

  #drawWeather(layer: Weather['layer'], scene: Parameters<Weather['draw']>[1]): void {
    this.#weather = this.#weather.filter(
      (effect) =>
        effect.layer !== layer ||
        this.#guard.survives('weather', () => effect.draw(this.#context, scene)),
    );
  }

  #apply(reaction: Reaction | null): void {
    if (!reaction) return;
    this.#effects.push([...reaction.effects, ...this.#juice.apply(reaction)]);
    this.#ground.push(reaction.ground ?? []);
  }
}
